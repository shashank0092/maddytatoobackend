import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const contentTypes = [
  {
    slug: 'tattoo',
    coverImageKey: 'content/types/tattoo/cover.webp',
    translations: {
      en: { name: 'Tattoo', description: 'Handcrafted tattoo artwork created by Maddy.', altText: 'Tattoo artwork created by Maddy.' },
      gu: { name: 'ટેટૂ', description: 'મેડી દ્વારા બનાવવામાં આવેલી હસ્તકલા ટેટૂ કલા.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ ટેટૂ આર્ટવર્ક.' },
    },
  },
  {
    slug: 'painting',
    coverImageKey: 'content/types/painting/cover.webp',
    translations: {
      en: { name: 'Painting', description: 'Original paintings and canvas artwork.', altText: 'Painting artwork created by Maddy.' },
      gu: { name: 'પેઇન્ટિંગ', description: 'મૂળ પેઇન્ટિંગ્સ અને કેનવાસ આર્ટવર્ક.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ પેઇન્ટિંગ આર્ટવર્ક.' },
    },
  },
  {
    slug: 'sculpture',
    coverImageKey: 'content/types/sculpture/cover.webp',
    translations: {
      en: { name: 'Sculpture', description: 'Handmade sculptures and 3D artwork.', altText: 'Sculpture created by Maddy.' },
      gu: { name: 'શિલ્પ', description: 'હાથથી બનાવેલા શિલ્પો અને 3D આર્ટવર્ક.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ શિલ્પ.' },
    },
  },
  {
    slug: 'sketch',
    coverImageKey: 'content/types/sketch/cover.webp',
    translations: {
      en: { name: 'Sketch', description: 'Pencil and charcoal sketches.', altText: 'Sketch artwork created by Maddy.' },
      gu: { name: 'સ્કેચ', description: 'પેન્સિલ અને ચારકોલ સ્કેચ.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ સ્કેચ આર્ટવર્ક.' },
    },
  },
  {
    slug: 'photography',
    coverImageKey: 'content/types/photography/cover.webp',
    translations: {
      en: { name: 'Photography', description: 'Professional photography captures.', altText: 'Photography by Maddy.' },
      gu: { name: 'ફોટોગ્રાફી', description: 'વ્યાવસાયિક ફોટોગ્રાફી કૅપ્ચર્સ.', altText: 'મેડી દ્વારા લેવામાં આવેલ ફોટોગ્રાફી.' },
    },
  },
  {
    slug: 'video',
    coverImageKey: 'content/types/video/cover.webp',
    translations: {
      en: { name: 'Video', description: 'Videography and motion art.', altText: 'Video content by Maddy.' },
      gu: { name: 'વિડિઓ', description: 'વિડિઓગ્રાફી અને મોશન આર્ટ.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ વિડિઓ.' },
    },
  },
  {
    slug: 'artwork',
    coverImageKey: 'content/types/artwork/cover.webp',
    translations: {
      en: { name: 'Artwork', description: 'Mixed media and general artwork.', altText: 'General artwork by Maddy.' },
      gu: { name: 'આર્ટવર્ક', description: 'મિશ્રિત માધ્યમ અને સામાન્ય આર્ટવર્ક.', altText: 'મેડી દ્વારા સામાન્ય આર્ટવર્ક.' },
    },
  },
];

const categories = [
  {
    slug: 'spiritual',
    coverImageKey: 'content/categories/spiritual/cover.webp',
    translations: {
      en: { name: 'Spiritual', description: 'Spiritual tattoo artwork inspired by faith, mythology and symbolism.', altText: 'Spiritual tattoo artwork category' },
      gu: { name: 'આધ્યાત્મિક', description: 'ધર્મ, પૌરાણિક કથાઓ અને પ્રતીકવાદથી પ્રેરિત આધ્યાત્મિક ટેટૂ આર્ટવર્ક.', altText: 'આધ્યાત્મિક ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'religious',
    coverImageKey: 'content/categories/religious/cover.webp',
    translations: {
      en: { name: 'Religious', description: 'Religious and divine artwork.', altText: 'Religious tattoo artwork category' },
      gu: { name: 'ધાર્મિક', description: 'ધાર્મિક અને દિવ્ય આર્ટવર્ક.', altText: 'ધાર્મિક ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'portrait',
    coverImageKey: 'content/categories/portrait/cover.webp',
    translations: {
      en: { name: 'Portrait', description: 'Realistic portrait artwork and tattoos.', altText: 'Portrait tattoo artwork category' },
      gu: { name: 'પોર્ટ્રેટ', description: 'વાસ્તવિક પોર્ટ્રેટ આર્ટવર્ક અને ટેટૂઝ.', altText: 'પોર્ટ્રેટ ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'nature',
    coverImageKey: 'content/categories/nature/cover.webp',
    translations: {
      en: { name: 'Nature', description: 'Artwork inspired by the natural world.', altText: 'Nature tattoo artwork category' },
      gu: { name: 'કુદરત', description: 'પ્રાકૃતિક વિશ્વથી પ્રેરિત આર્ટવર્ક.', altText: 'કુદરત ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'animals',
    coverImageKey: 'content/categories/animals/cover.webp',
    translations: {
      en: { name: 'Animals', description: 'Animal and wildlife artwork.', altText: 'Animal tattoo artwork category' },
      gu: { name: 'પ્રાણીઓ', description: 'પ્રાણીઓ અને વન્યજીવન આર્ટવર્ક.', altText: 'પ્રાણી ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'minimal',
    coverImageKey: 'content/categories/minimal/cover.webp',
    translations: {
      en: { name: 'Minimal', description: 'Minimalist and simple tattoo artwork.', altText: 'Minimalist tattoo artwork category' },
      gu: { name: 'ન્યૂનતમ', description: 'ન્યૂનતમ અને સરળ ટેટૂ આર્ટવર્ક.', altText: 'ન્યૂનતમ ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'custom',
    coverImageKey: 'content/categories/custom/cover.webp',
    translations: {
      en: { name: 'Custom', description: 'Custom designed tattoo artwork.', altText: 'Custom tattoo artwork category' },
      gu: { name: 'કસ્ટમ', description: 'કસ્ટમ ડિઝાઇન કરેલ ટેટૂ આર્ટવર્ક.', altText: 'કસ્ટમ ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'abstract',
    coverImageKey: 'content/categories/abstract/cover.webp',
    translations: {
      en: { name: 'Abstract', description: 'Abstract and conceptual artwork.', altText: 'Abstract tattoo artwork category' },
      gu: { name: 'અમૂર્ત', description: 'અમૂર્ત અને વૈચારિક આર્ટવર્ક.', altText: 'અમૂર્ત ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
];

async function main() {
  console.log('🌱 Seeding Content Types...');

  for (const ct of contentTypes) {
    // 1. Upsert Content Type
    const contentType = await prisma.contentType.upsert({
      where: { slug: ct.slug },
      update: { cover_image_key: ct.coverImageKey },
      create: {
        slug: ct.slug,
        cover_image_key: ct.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Content Type: ${ct.slug}`);

    // 2. Upsert English Translation
    await prisma.contentTypeTranslation.upsert({
      where: {
        content_type_id_language_code: {
          content_type_id: contentType.id,
          language_code: 'en',
        },
      },
      update: {
        name: ct.translations.en.name,
        description: ct.translations.en.description,
        alt_text: ct.translations.en.altText,
      },
      create: {
        content_type_id: contentType.id,
        language_code: 'en',
        name: ct.translations.en.name,
        description: ct.translations.en.description,
        alt_text: ct.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.contentTypeTranslation.upsert({
      where: {
        content_type_id_language_code: {
          content_type_id: contentType.id,
          language_code: 'gu',
        },
      },
      update: {
        name: ct.translations.gu.name,
        description: ct.translations.gu.description,
        alt_text: ct.translations.gu.altText,
      },
      create: {
        content_type_id: contentType.id,
        language_code: 'gu',
        name: ct.translations.gu.name,
        description: ct.translations.gu.description,
        alt_text: ct.translations.gu.altText,
      },
    });
  }

  console.log('🌱 Seeding Categories...');

  for (const cat of categories) {
    // 1. Upsert Category
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { cover_image_key: cat.coverImageKey },
      create: {
        slug: cat.slug,
        cover_image_key: cat.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Category: ${cat.slug}`);

    // 2. Upsert English Translation
    await prisma.categoryTranslation.upsert({
      where: {
        category_id_language_code: {
          category_id: category.id,
          language_code: 'en',
        },
      },
      update: {
        name: cat.translations.en.name,
        description: cat.translations.en.description,
        alt_text: cat.translations.en.altText,
      },
      create: {
        category_id: category.id,
        language_code: 'en',
        name: cat.translations.en.name,
        description: cat.translations.en.description,
        alt_text: cat.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.categoryTranslation.upsert({
      where: {
        category_id_language_code: {
          category_id: category.id,
          language_code: 'gu',
        },
      },
      update: {
        name: cat.translations.gu.name,
        description: cat.translations.gu.description,
        alt_text: cat.translations.gu.altText,
      },
      create: {
        category_id: category.id,
        language_code: 'gu',
        name: cat.translations.gu.name,
        description: cat.translations.gu.description,
        alt_text: cat.translations.gu.altText,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
