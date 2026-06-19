export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { generateBlueprintWithClaude } from '@/lib/claude';
import { calculateLifePath, calculateBirthdayNumber, calculatePersonalYear } from '@/lib/numerology';

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const { readingId } = await request.json();
    if (!readingId) {
      return NextResponse.json({ success: false, message: 'Reading ID required' }, { status: 400 });
    }

    // Get reading with client profile
    const { data: reading, error: readingError } = await supabaseAdmin
      .from('readings')
      .select('*, client_profiles(*)')
      .eq('id', readingId)
      .single();

    if (readingError || !reading) {
      return NextResponse.json({ success: false, message: 'Reading not found' }, { status: 404 });
    }

    const profile = reading.client_profiles;
    if (!profile) {
      return NextResponse.json({ success: false, message: 'Client profile not found' }, { status: 404 });
    }

    // Update status to processing
    await supabaseAdmin
      .from('readings')
      .update({ status: 'processing' })
      .eq('id', readingId);

    // Calculate numerology
    const lifePathNumber = profile.life_path_number || calculateLifePath(profile.dob);
    const birthdayNumber = profile.birthday_number || calculateBirthdayNumber(profile.dob);
    const personalYear = profile.personal_year || calculatePersonalYear(profile.dob, new Date().getFullYear());

    // Generate blueprint with real astrology data
    const blueprintHtml = await generateBlueprintWithClaude({
      name: profile.first_name,
      dob: profile.dob,
      birthTime: profile.birth_time || '12:00',
      birthPlace: profile.birth_place,
      gender: profile.gender,
      lifePathNumber,
      birthdayNumber,
      personalYear,
      questions: reading.questions,
      readingType: reading.reading_type,
    });

    // Save blueprint
    const { data: blueprint, error: blueprintError } = await supabaseAdmin
      .from('blueprints')
      .upsert({
        reading_id: readingId,
        content_html: blueprintHtml,
        generation_status: 'completed',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (blueprintError) {
      await supabaseAdmin
        .from('readings')
        .update({ status: 'approved' })
        .eq('id', readingId);
      return NextResponse.json({ success: false, message: 'Failed to save blueprint' }, { status: 500 });
    }

    // Update reading status to delivered
    await supabaseAdmin
      .from('readings')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', readingId);

    return NextResponse.json({
      success: true,
      message: 'Blueprint generated successfully!',
      data: { blueprintId: blueprint.id },
    });

  } catch (error: any) {
    console.error('Generate blueprint error:', error);
    return NextResponse.json({
      success: false,
      message: `Blueprint generation failed — ${error.message}`,
    }, { status: 500 });
  }
}
