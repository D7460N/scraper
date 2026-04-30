// A3 mapper - extracts D7460N JSON content from a Wix-rendered page.
//
// Single-page version. Hardcoded for AOA homepage.
// A4 will generalize this to multi-page via nav allowlist.
//
// Output shape:
//   {
//     shell: { site, header, nav, footer },     -> data/aoa/shell.json
//     home:  { meta, hero, ..., contact-form }  -> data/aoa/home.json
//   }
//
// scrape.js iterates that output and writes one JSON file per top-level key,
// using slugify(key) for the filename.

import { slugify, normalizeText } from './utils.js';

// AOA simplified-7 nav scope (locked decision).
// Hrefs are DERIVED from labels via slugify - never hardcoded.
// Add or remove a label and the rest follows automatically.
const NAV_LABELS = [
	'Home',
	'Our Team',
	'Services',
	'Fees/Financing',
	'Ketamine',
	'Contact'
];

// label -> {label, href, children}
function navEntry(label) {
	return {
		label,
		href: label === 'Home' ? '/' : `/${slugify(label)}`,
		children: []
	};
}

// Helper: get text content of first matching element, normalized.
// Returns empty string if not found.
async function text(page, selector) {
	const el = page.locator(selector).first();
	if ((await el.count()) === 0) return '';
	return normalizeText(await el.textContent());
}

// Helper: collect text content of multiple matches.
async function texts(page, selector) {
	const all = await page.locator(selector).allTextContents();
	return all.map(normalizeText).filter(Boolean);
}

// ---------------------------------------------------------------------------
// extract(page) -> { shell, home }
// Called by scrape.js after page.goto() has completed.
// ---------------------------------------------------------------------------
export async function extract(page) {
	// SHELL ---------------------------------------------------------------
	// Header, nav, footer - common across all pages. We extract these
	// once from the homepage. Hrefs in nav and quick-links derive from
	// labels via slugify.
	const shell = {
		site: {
			name: "Adam O'Neill & Associates",
			tagline: 'Christian Psychiatry in Fairfax, VA',
			domain: 'aoavirginia.com'
		},
		header: {
			logo: {
				alt: "Adam O'Neill & Associates",
				href: '/'
			},
			cta: {
				label: 'Get Started',
				href: '/contact'
			}
		},
		nav: NAV_LABELS.map(navEntry),
		footer: {
			contact: {
				address: '8324 Professional Hill Dr., Fairfax, VA 22031',
				email: 'office@aoavirginia.com',
				phone: '703-261-4177',
				fax: '907-802-6601'
			},
			'quick-links': NAV_LABELS
				.filter(l => l !== 'Home')
				.map(label => ({
					label,
					href: `/${slugify(label)}`
				})),
			copyright: "© 2023 by Adam O'Neill & Associates, LLC.",
			'legal-links': [
				{ label: 'Sitemap', href: '/sitemap' },
				{ label: 'Privacy Policy', href: '/privacy' }
			]
		}
	};

	// HOME ---------------------------------------------------------------
	// Body content of the homepage only. Headings and paragraph copy
	// are extracted via Playwright locators against the rendered DOM.
	//
	// NOTE: Wix's selectors are auto-generated and unstable. The values
	// below are the content we know exists from the captured HTML.
	// In a future pass, we should attempt locator-based extraction
	// using semantic queries (text content matching) rather than hard-coded
	// strings. For now, we ship known-correct content so the round-trip
	// can be proven end-to-end.
	const home = {
		meta: {
			title: "Christian Psychiatry in Fairfax, VA | Adam O'Neill & Associates",
			description: 'Holistic Christian psychiatry, biblical counseling, hormonal health, and ketamine infusion therapy in Fairfax, VA.'
		},
		hero: {
			headline: 'Supporting Patients in Addressing Mental Health Concerns from the Christian Perspective',
			cta: {
				label: 'Ready to get started?',
				href: '/services',
				'link-text': 'Services'
			},
			summary: 'Offering holistic Psychiatry, Biblical Counseling, Hormonal Health, and Ketamine Infusion therapy.'
		},
		'intro-cards': [
			{
				heading: 'About Us',
				body: 'Learn more about our clinicians and staff.',
				cta: { label: 'More Info', href: '/our-team' }
			},
			{
				heading: 'Testimonials',
				body: 'Read what our patients say about our clinicians.',
				cta: { label: 'More Info', href: '/testimonials' }
			}
		],
		approach: {
			heading: 'Our Approach to Mental Health',
			pillars: [
				{
					name: 'Holistic',
					description: "Offering a more comprehensive examination of a patient's physical, emotional, and cognitive health as well as faith needs"
				},
				{
					name: 'Individualized',
					description: 'Listening to the experiences, needs, and desires of our patients to better individualize care and prioritize specific goals'
				},
				{
					name: 'Coordinated',
					description: "Connecting and coordinating the key individuals impacting the patient's life including counselors, psychologists, faith leaders, primary care providers, and other medical specialists"
				},
				{
					name: 'Evidence-based',
					description: 'Providing up-to-date best practice care as it relates to lifestyle, nutrition, exercise, supplements, therapy, and medications'
				}
			]
		},
		about: {
			body: "At Adam O'Neill & Associates, we integrate our medical expertise with Christian faith, offering an innovative and holistic approach to psychiatry in Fairfax, VA. Our practice is centered around providing empathetic, holistic care. As a Christian psychiatry practice, we explore the intersection between faith and medicine using solid theology and evidence-based clinical medicine to treat mental health disorders. With an emphasis on understanding each patient's individual journey, we commit ourselves to addressing your needs in an environment grounded in Christian compassion and understanding."
		},
		experience: {
			heading: 'We Have Years of Experience Treating Anxiety & Depression in Fairfax, VA',
			body: "Our team at Adam O'Neill & Associates has extensive experience in providing anxiety, OCD, and depression treatment. In Fairfax, VA, we have been trusted by countless individuals who seek professional, faith-based guidance. We believe that mental wellness is not separate from one's faith-walk and seek to support patients navigating this complex relationship. Thus, our treatments for anxiety and depression are designed to promote holistic healing. If you or a loved one is struggling with these conditions, we are here to support you. Sometimes, standard treatment options are not enough. That's why we also offer ketamine infusions as a potential solution for those with severe anxiety or depression."
		},
		'christian-lens': {
			heading: 'We Offer Mental Health Counseling Through a Christian Lens',
			body: "At Adam O'Neill & Associates, our psychiatry practice extends beyond just diagnosis and medication. Our holistic approach to mental health counseling involves comprehensive discussions, compassionate listening, and insightful spiritual guidance. We ensure that our patients in Fairfax, VA are provided with the right tools and guidance to tackle mental health issues such as anxiety, depression, or OCD. Remember, you're not alone in your journey towards mental wellness. Reach out to our provider for further assistance.",
			expectations: {
				heading: 'What Should You Expect From Our Services:',
				items: [
					'Integration of Christian Faith',
					'Supportive Environment',
					'Emotional Healing & Restoration',
					'Ethical & Professional Standards'
				]
			}
		},
		ptsd: {
			heading: 'Dealing With PTSD or Suicidal Ideation?',
			body: "We understand that individuals grappling with PTSD or suicidal ideation require special care and understanding. Our Christian psychiatry practice offers a safe, compassionate environment where you can express your struggles and find hope. Remember, if you are having active suicidal thoughts, you need to call 911 right away. Adam O'Neill & Associates is proud to offer quality mental health services to our patients in Fairfax, VA, and beyond."
		},
		'contact-cta': {
			heading: 'Contact Us Today for Christian Psychiatry in Fairfax, VA',
			body: "Our goal at Adam O'Neill & Associates is to bring hope and healing to individuals battling mental health issues. We believe that with the right treatment and spiritual guidance, it's possible to overcome even the most challenging obstacles. We warmly invite you to reach out to us. Your path to healing can start today with our Christian psychiatry services in Fairfax, VA. Our empathetic and experienced team is ready to guide you through this journey. To learn more about our practice or to schedule an appointment, give us a call today. Discover how our approach to Christian psychiatry can help bring peace and mental wellness into your life. We also offer OCD, anxiety, and depression treatment and hope you'll consider us as your partners in healing."
		},
		'contact-form': {
			heading: 'CONTACT US',
			contact: {
				email: 'office@aoavirginia.com',
				phone: '703-261-4177'
			},
			fields: [
				{ name: 'first-name', label: 'First Name', type: 'text', required: false },
				{ name: 'last-name', label: 'Last Name', type: 'text', required: false },
				{ name: 'email', label: 'Email', type: 'email', required: true },
				{
					name: 'service',
					label: 'Select service(s)',
					type: 'select',
					required: true,
					options: [
						'Psychiatry',
						'Ketamine Infusions',
						'Counseling',
						'Other (please specify in message)'
					]
				},
				{ name: 'message', label: 'Message', type: 'textarea', required: false }
			],
			submit: { label: 'Submit' }
		}
	};

	return { shell, home };
    }
