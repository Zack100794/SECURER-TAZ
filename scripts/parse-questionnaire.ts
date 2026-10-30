import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QuestionData {
  section_title: string;
  question_number: number;
  question_text: string;
  input_type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select';
  options: string[] | null;
  is_required: boolean;
  display_order: number;
}

async function parseQuestionnaire() {
  console.log('📄 Parsing questionnaire HTML...');

  const htmlPath = path.join(process.cwd(), 'docs', 'SECURER Questionnaire.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('❌ Questionnaire HTML not found at:', htmlPath);
    process.exit(1);
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);

  // First, create or get the questionnaire
  const { data: existingQuestionnaire } = await supabase
    .from('questionnaires')
    .select('id')
    .eq('name', 'Smart Home Requirements Questionnaire')
    .single();

  let questionnaireId: string;

  if (existingQuestionnaire) {
    console.log('✓ Questionnaire already exists, updating...');
    questionnaireId = existingQuestionnaire.id;
    
    // Delete existing questions
    await supabase
      .from('questions')
      .delete()
      .eq('questionnaire_id', questionnaireId);
  } else {
    console.log('✓ Creating new questionnaire...');
    const { data: newQuestionnaire, error } = await supabase
      .from('questionnaires')
      .insert({
        name: 'Smart Home Requirements Questionnaire',
        description: 'Comprehensive questionnaire to understand smart home system requirements and security needs',
        version: '1.0',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating questionnaire:', error);
      process.exit(1);
    }

    questionnaireId = newQuestionnaire.id;
  }

  const questions: QuestionData[] = [];
  let displayOrder = 0;

  // Parse each section
  $('.section').each((sectionIndex, sectionElement) => {
    const sectionTitle = $(sectionElement).find('.section-title').text().trim();
    console.log(`\n📌 Parsing section: ${sectionTitle}`);

    // Parse questions in this section
    $(sectionElement).find('.question').each((_, questionElement) => {
      const questionText = $(questionElement).find('.question-text').text().trim();
      
      // Extract question number from text (e.g., "1. What is..." -> 1)
      const questionNumberMatch = questionText.match(/^(\d+)\./);
      const questionNumber = questionNumberMatch ? parseInt(questionNumberMatch[1]) : displayOrder + 1;

      // Determine input type and extract options
      let inputType: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select' = 'text';
      let options: string[] = [];
      let isRequired = false;

      // Check for radio buttons
      const radioInputs = $(questionElement).find('input[type="radio"]');
      if (radioInputs.length > 0) {
        inputType = 'radio';
        radioInputs.each((_, input) => {
          const label = $(input).parent().text().trim();
          if (label) options.push(label);
        });
        isRequired = $(radioInputs.first()).attr('required') === 'required';
      }

      // Check for checkboxes
      const checkboxInputs = $(questionElement).find('input[type="checkbox"]');
      if (checkboxInputs.length > 0) {
        inputType = 'checkbox';
        checkboxInputs.each((_, input) => {
          const label = $(input).parent().text().trim();
          if (label) options.push(label);
        });
      }

      // Check for select
      const selectElement = $(questionElement).find('select');
      if (selectElement.length > 0) {
        inputType = 'select';
        selectElement.find('option').each((_, option) => {
          const value = $(option).val() as string;
          if (value) options.push(value);
        });
      }

      // Check for textarea
      if ($(questionElement).find('textarea').length > 0) {
        inputType = 'textarea';
      }

      displayOrder++;

      questions.push({
        section_title: sectionTitle,
        question_number: questionNumber,
        question_text: questionText,
        input_type: inputType,
        options: options.length > 0 ? options : null,
        is_required: isRequired,
        display_order: displayOrder,
      });

      console.log(`  ✓ Q${questionNumber}: ${inputType} (${options.length} options)`);
    });
  });

  console.log(`\n✓ Parsed ${questions.length} questions`);

  // Insert questions into database
  console.log('\n💾 Inserting questions into database...');
  
  const questionsToInsert = questions.map((q) => ({
    questionnaire_id: questionnaireId,
    ...q,
  }));

  const { error: insertError } = await supabase
    .from('questions')
    .insert(questionsToInsert);

  if (insertError) {
    console.error('❌ Error inserting questions:', insertError);
    process.exit(1);
  }

  console.log('✅ Successfully parsed and uploaded questionnaire!');
  console.log(`   Questionnaire ID: ${questionnaireId}`);
  console.log(`   Total questions: ${questions.length}`);
}

// Run the parser
parseQuestionnaire().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
