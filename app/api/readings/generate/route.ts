export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { generateBlueprintWithClaude } from '@/lib/claude';
import { generateBlueprintPDF } from '@/lib/pdf';
import { sendBlueprintEmail, sendBlueprintWhatsApp } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { readingId } = await request.json();
    if (!readingId) {
      return NextResponse.json({ success: false, message: 'readingId is required' }, { status: 400 });
    }

    // Get full reading with profile
    const { data: reading, error: readingError } = await supabaseAdmin
      .from('readings')
      .select('*, client_profiles(*)')
      .eq('id', readingId)
      .single();

    if (!reading || readingError) {
      return NextResponse.json({ success: false, message: 'Reading not found' }, { status: 404 });
    }

    const profile = reading.client_profiles;

    // Get user info
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', reading.user_id)
      .single();

    // Mark as processing
    await supabaseAdmin.from('readings').update({ status: 'processing' }).eq('id', readingId);

    // Generate blueprint with Claude
    let blueprintHtml: string;
    try {
      blueprintHtml = await generateBlueprintWithClaude({
        name: profile.first_name || userData?.first_name || 'Valued Soul',
        dob: profile.dob,
        birthTime: profile.birth_time,
        birthPlace: profile.birth_place,
        gender: profile.gender,
        lifePathNumber: profile.life_path_number,
        birthdayNumber: profile.birthday_number,
        personalYear: profile.personal_year,
        questions: reading.questions,
        readingType: reading.reading_type,
      });
    } catch (claudeError) {
      console.error('Claude error:', claudeError);
      await supabaseAdmin.from('readings').update({ status: 'approved' }).eq('id', readingId);
      return NextResponse.json({ success: false, message: 'Blueprint generation failed — Claude API error' }, { status: 500 });
    }

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateBlueprintPDF(
        blueprintHtml,
        profile.first_name || userData?.first_name || 'Valued Soul',
        profile.life_path_number
      );
    } catch (pdfError) {
      console.error('PDF error:', pdfError);
      return NextResponse.json({ success: false, message: 'PDF generation failed' }, { status: 500 });
    }

    // Upload PDF to Supabase Storage
    const fileName = `${readingId}_${Date.now()}.pdf`;
    const { error: storageError } = await supabaseAdmin.storage
      .from('blueprints')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json({ success: false, message: 'PDF upload failed' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('blueprints').getPublicUrl(fileName);

    // Save blueprint record
    await supabaseAdmin.from('blueprints').upsert({
      reading_id: readingId,
      content_html: blueprintHtml,
      pdf_url: publicUrl,
      generation_status: 'completed',
      generated_at: new Date().toISOString(),
    });

    // Update reading status
    await supabaseAdmin.from('readings').update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    }).eq('id', readingId);

    // Deliver via email
    const clientEmail = userData?.email;
    const clientName = profile.first_name || userData?.first_name || 'Valued Soul';

    if (clientEmail) {
      sendBlueprintEmail(clientEmail, clientName, publicUrl).catch(console.error);
    }

    // Deliver via WhatsApp
    if (userData?.whatsapp_number) {
      sendBlueprintWhatsApp(userData.whatsapp_number, clientName, publicUrl).catch(console.error);
    }

    // CRM log
    await supabaseAdmin.from('crm_tracking').insert({
      user_id: reading.user_id,
      interaction_type: 'blueprint_delivered',
      details: { reading_id: readingId, pdf_url: publicUrl, delivered_by: user!.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Blueprint generated and delivered',
      data: { pdfUrl: publicUrl, readingId },
    });
  } catch (error) {
    console.error('Generate blueprint error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
