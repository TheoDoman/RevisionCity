// History content generator for IGCSE
const fs = require('fs');

const historyTopics = [
  {
    name: 'The First World War 1914-18',
    slug: 'the-first-world-war-1914-18',
    description: 'Causes, events, and consequences of WWI',
    subtopics: [
      { name: 'Causes of the First World War', slug: 'causes-of-the-first-world-war', description: 'Understanding the long-term and short-term causes that led to the outbreak of WWI in 1914.' },
      { name: 'The Western Front', slug: 'the-western-front', description: 'The nature of trench warfare and major battles on the Western Front from 1914-1918.' },
      { name: 'Other Fronts', slug: 'other-fronts', description: 'The war on the Eastern Front, Italy, Gallipoli, and other theaters beyond the Western Front.' },
      { name: 'The War at Sea', slug: 'the-war-at-sea', description: 'Naval warfare including the Battle of Jutland, submarine warfare, and the blockade.' },
      { name: 'The Home Front', slug: 'the-home-front', description: 'The impact of total war on civilian populations, including rationing, propaganda, and women\'s roles.' },
      { name: 'Entry of the USA', slug: 'entry-of-the-usa', description: 'Reasons for American entry into WWI in 1917 and its impact on the war.' },
      { name: 'The Russian Revolutions', slug: 'the-russian-revolutions', description: 'The February and October Revolutions and Russia\'s withdrawal from the war.' },
      { name: 'The End of the War', slug: 'the-end-of-the-war', description: 'The final offensives of 1918 and the reasons for German defeat.' },
      { name: 'The Treaty of Versailles', slug: 'the-treaty-of-versailles', description: 'The peace settlement and its terms, particularly those imposed on Germany.' }
    ]
  },
  {
    name: 'Germany 1918-45',
    slug: 'germany-1918-45',
    description: 'Weimar Republic, rise of Hitler, and Nazi Germany',
    subtopics: [
      { name: 'The Weimar Republic 1918-23', slug: 'the-weimar-republic-1918-23', description: 'The creation and early challenges of the Weimar Republic.' },
      { name: 'Recovery and Stresemann', slug: 'recovery-and-stresemann', description: 'Economic and political recovery under Gustav Stresemann 1924-29.' },
      { name: 'The Depression and Rise of Nazis', slug: 'the-depression-and-rise-of-nazis', description: 'The Great Depression and the Nazi rise to power 1929-33.' },
      { name: 'Nazi Consolidation of Power', slug: 'nazi-consolidation-of-power', description: 'How Hitler established a dictatorship 1933-34.' },
      { name: 'Nazi Control and Opposition', slug: 'nazi-control-and-opposition', description: 'Methods of control including propaganda, terror, and opposition to the regime.' },
      { name: 'Nazi Economic and Social Policy', slug: 'nazi-economic-and-social-policy', description: 'Economic policies, employment, and social programs.' },
      { name: 'Nazi Racial Policy', slug: 'nazi-racial-policy', description: 'Persecution of Jews and other minorities, leading to the Holocaust.' },
      { name: 'Nazi Foreign Policy 1933-39', slug: 'nazi-foreign-policy-1933-39', description: 'Hitler\'s foreign policy and the road to war.' },
      { name: 'Life in Nazi Germany', slug: 'life-in-nazi-germany', description: 'Daily life, youth, women, and culture under Nazi rule.' }
    ]
  },
  {
    name: 'Russia 1905-41',
    slug: 'russia-1905-41',
    description: 'Revolution, civil war, and Stalinist rule',
    subtopics: [
      { name: 'Russia under the Tsars', slug: 'russia-under-the-tsars', description: 'The autocratic system and the 1905 Revolution.' },
      { name: 'The February Revolution 1917', slug: 'the-february-revolution-1917', description: 'The collapse of Tsarism and the Provisional Government.' },
      { name: 'The October Revolution 1917', slug: 'the-october-revolution-1917', description: 'The Bolshevik seizure of power.' },
      { name: 'The Civil War 1918-21', slug: 'the-civil-war-1918-21', description: 'Reds versus Whites and the consolidation of Bolshevik power.' },
      { name: 'War Communism and NEP', slug: 'war-communism-and-nep', description: 'Economic policies under Lenin.' },
      { name: 'Stalin\'s Rise to Power', slug: 'stalins-rise-to-power', description: 'The power struggle after Lenin\'s death.' },
      { name: 'Collectivization', slug: 'collectivization', description: 'The forced collectivization of agriculture and its consequences.' },
      { name: 'The Five-Year Plans', slug: 'the-five-year-plans', description: 'Rapid industrialization under Stalin.' },
      { name: 'The Great Terror', slug: 'the-great-terror', description: 'Political purges and repression in the 1930s.' }
    ]
  },
  {
    name: 'The USA 1919-41',
    slug: 'the-usa-1919-41',
    description: 'The boom, Depression, and New Deal',
    subtopics: [
      { name: 'The Economic Boom', slug: 'the-economic-boom', description: 'Prosperity in the 1920s.' },
      { name: 'Social Changes in the 1920s', slug: 'social-changes-in-the-1920s', description: 'Flappers, prohibition, and social tensions.' },
      { name: 'The Wall Street Crash', slug: 'the-wall-street-crash', description: 'The 1929 stock market crash.' },
      { name: 'The Great Depression', slug: 'the-great-depression', description: 'Economic collapse and social impact.' },
      { name: 'Hoover\'s Response', slug: 'hoovers-response', description: 'President Hoover\'s policies and their failure.' },
      { name: 'Roosevelt and the New Deal', slug: 'roosevelt-and-the-new-deal', description: 'FDR\'s election and early New Deal programs.' },
      { name: 'The Second New Deal', slug: 'the-second-new-deal', description: 'Later New Deal reforms and their impact.' },
      { name: 'Opposition to the New Deal', slug: 'opposition-to-the-new-deal', description: 'Critics and challenges to Roosevelt\'s policies.' },
      { name: 'Impact of the New Deal', slug: 'impact-of-the-new-deal', description: 'Assessing the success and failures of the New Deal.' }
    ]
  },
  {
    name: 'China c.1930-c.1990',
    slug: 'china-c1930-c1990',
    description: 'Civil war, Communist revolution, and Mao\'s China',
    subtopics: [
      { name: 'The Chinese Civil War', slug: 'the-chinese-civil-war', description: 'Nationalists versus Communists 1927-49.' },
      { name: 'The Long March', slug: 'the-long-march', description: 'The Communist retreat and survival 1934-35.' },
      { name: 'The Communist Victory 1949', slug: 'the-communist-victory-1949', description: 'Reasons for Communist success.' },
      { name: 'Early Communist Rule', slug: 'early-communist-rule', description: 'Establishing control and early reforms.' },
      { name: 'The Great Leap Forward', slug: 'the-great-leap-forward', description: 'Mao\'s failed economic program 1958-62.' },
      { name: 'The Cultural Revolution', slug: 'the-cultural-revolution', description: 'Political upheaval 1966-76.' },
      { name: 'Life under Mao', slug: 'life-under-mao', description: 'Daily life, education, and propaganda.' },
      { name: 'Mao\'s Foreign Policy', slug: 'maos-foreign-policy', description: 'Relations with USSR and USA.' },
      { name: 'China after Mao', slug: 'china-after-mao', description: 'Deng Xiaoping and economic reforms.' }
    ]
  },
  {
    name: 'South Africa c.1940-c.1994',
    slug: 'south-africa-c1940-c1994',
    description: 'Apartheid and the struggle for equality',
    subtopics: [
      { name: 'Origins of Apartheid', slug: 'origins-of-apartheid', description: 'Racial segregation before 1948.' },
      { name: 'Apartheid Legislation', slug: 'apartheid-legislation', description: 'Laws implementing racial separation.' },
      { name: 'Resistance to Apartheid', slug: 'resistance-to-apartheid', description: 'The ANC and other opposition groups.' },
      { name: 'The Sharpeville Massacre', slug: 'the-sharpeville-massacre', description: 'The 1960 massacre and its aftermath.' },
      { name: 'The Soweto Uprising', slug: 'the-soweto-uprising', description: 'Student protests in 1976.' },
      { name: 'International Opposition', slug: 'international-opposition', description: 'Sanctions and global pressure.' },
      { name: 'The Release of Mandela', slug: 'the-release-of-mandela', description: 'F.W. de Klerk and negotiations.' },
      { name: 'The End of Apartheid', slug: 'the-end-of-apartheid', description: 'Transition to democracy.' },
      { name: 'The 1994 Elections', slug: 'the-1994-elections', description: 'South Africa\'s first democratic elections.' }
    ]
  },
  {
    name: 'The Arab-Israeli conflict since 1945',
    slug: 'the-arab-israeli-conflict-since-1945',
    description: 'The creation of Israel and subsequent conflicts',
    subtopics: [
      { name: 'Palestine before 1945', slug: 'palestine-before-1945', description: 'British mandate and competing claims.' },
      { name: 'The Creation of Israel 1947-48', slug: 'the-creation-of-israel-1947-48', description: 'UN partition and Israeli independence.' },
      { name: 'The 1948-49 War', slug: 'the-1948-49-war', description: 'The first Arab-Israeli war.' },
      { name: 'The Suez Crisis 1956', slug: 'the-suez-crisis-1956', description: 'The Suez War and its consequences.' },
      { name: 'The Six Day War 1967', slug: 'the-six-day-war-1967', description: 'Israeli territorial expansion.' },
      { name: 'The Yom Kippur War 1973', slug: 'the-yom-kippur-war-1973', description: 'The October War and oil crisis.' },
      { name: 'The Palestinians', slug: 'the-palestinians', description: 'The PLO and Palestinian nationalism.' },
      { name: 'Peace Efforts', slug: 'peace-efforts', description: 'Camp David, Oslo Accords, and peace attempts.' },
      { name: 'The Intifadas', slug: 'the-intifadas', description: 'Palestinian uprisings in 1987 and 2000.' }
    ]
  },
  {
    name: 'The Gulf 1970-2000',
    slug: 'the-gulf-1970-2000',
    description: 'Conflicts in the Gulf region',
    subtopics: [
      { name: 'The Iranian Revolution 1979', slug: 'the-iranian-revolution-1979', description: 'The fall of the Shah and rise of Khomeini.' },
      { name: 'The Iran-Iraq War 1980-88', slug: 'the-iran-iraq-war-1980-88', description: 'Causes, course, and consequences of the war.' },
      { name: 'Saddam Hussein\'s Iraq', slug: 'saddam-husseins-iraq', description: 'Dictatorship and repression in Iraq.' },
      { name: 'The Invasion of Kuwait 1990', slug: 'the-invasion-of-kuwait-1990', description: 'Iraq\'s annexation of Kuwait.' },
      { name: 'The Gulf War 1991', slug: 'the-gulf-war-1991', description: 'Operation Desert Storm and Iraqi defeat.' },
      { name: 'Consequences of the Gulf War', slug: 'consequences-of-the-gulf-war', description: 'Sanctions, no-fly zones, and instability.' },
      { name: 'Oil and the Gulf', slug: 'oil-and-the-gulf', description: 'The importance of oil in regional politics.' },
      { name: 'The Kurds', slug: 'the-kurds', description: 'Kurdish nationalism and repression.' },
      { name: 'International Involvement', slug: 'international-involvement', description: 'US and UN roles in the Gulf.' }
    ]
  },
  {
    name: 'The Cold War 1945-91',
    slug: 'the-cold-war-1945-91',
    description: 'Superpower rivalry and global tensions',
    subtopics: [
      { name: 'Origins of the Cold War', slug: 'origins-of-the-cold-war', description: 'Breakdown of the wartime alliance 1945-46.' },
      { name: 'Containment and Truman Doctrine', slug: 'containment-and-truman-doctrine', description: 'US policy to contain communism.' },
      { name: 'The Berlin Blockade 1948-49', slug: 'the-berlin-blockade-1948-49', description: 'The first major Cold War crisis.' },
      { name: 'The Korean War 1950-53', slug: 'the-korean-war-1950-53', description: 'The first hot war of the Cold War.' },
      { name: 'The Hungarian Uprising 1956', slug: 'the-hungarian-uprising-1956', description: 'Soviet suppression of reform.' },
      { name: 'The Cuban Missile Crisis 1962', slug: 'the-cuban-missile-crisis-1962', description: 'The closest point to nuclear war.' },
      { name: 'The Vietnam War', slug: 'the-vietnam-war', description: 'American involvement in Vietnam.' },
      { name: 'Detente', slug: 'detente', description: 'Relaxation of tensions in the 1970s.' },
      { name: 'The End of the Cold War', slug: 'the-end-of-the-cold-war', description: 'Gorbachev, reforms, and Soviet collapse.' }
    ]
  },
  {
    name: 'The United Nations',
    slug: 'the-united-nations',
    description: 'The UN\'s structure, role, and effectiveness',
    subtopics: [
      { name: 'Origins and Structure of the UN', slug: 'origins-and-structure-of-the-un', description: 'Formation and organization of the United Nations.' },
      { name: 'The Security Council', slug: 'the-security-council', description: 'Role and limitations of the Security Council.' },
      { name: 'The General Assembly', slug: 'the-general-assembly', description: 'Functions and significance of the General Assembly.' },
      { name: 'UN Peacekeeping', slug: 'un-peacekeeping', description: 'Peacekeeping operations and their effectiveness.' },
      { name: 'The UN and Korea', slug: 'the-un-and-korea', description: 'UN involvement in the Korean War.' },
      { name: 'The UN and the Congo', slug: 'the-un-and-the-congo', description: 'UN intervention in the Congo crisis.' },
      { name: 'The UN and Human Rights', slug: 'the-un-and-human-rights', description: 'Universal Declaration and human rights work.' },
      { name: 'Specialized UN Agencies', slug: 'specialized-un-agencies', description: 'WHO, UNESCO, UNICEF, and other agencies.' },
      { name: 'Successes and Failures of the UN', slug: 'successes-and-failures-of-the-un', description: 'Evaluating UN effectiveness.' }
    ]
  },
  {
    name: 'International relations since 1945',
    slug: 'international-relations-since-1945',
    description: 'Global developments and international cooperation',
    subtopics: [
      { name: 'Decolonization', slug: 'decolonization', description: 'The end of European empires.' },
      { name: 'The Non-Aligned Movement', slug: 'the-non-aligned-movement', description: 'Third World nations and neutrality.' },
      { name: 'Regional Organizations', slug: 'regional-organizations', description: 'NATO, Warsaw Pact, and other alliances.' },
      { name: 'The European Union', slug: 'the-european-union', description: 'European integration and the EU.' },
      { name: 'Nuclear Weapons and Arms Control', slug: 'nuclear-weapons-and-arms-control', description: 'The nuclear arms race and disarmament efforts.' },
      { name: 'Terrorism', slug: 'terrorism', description: 'International terrorism and responses.' },
      { name: 'Globalization', slug: 'globalization', description: 'Economic and cultural globalization.' },
      { name: 'Environmental Issues', slug: 'environmental-issues', description: 'Climate change and international cooperation.' },
      { name: 'Contemporary Conflicts', slug: 'contemporary-conflicts', description: 'Recent wars and international tensions.' }
    ]
  }
];

// This file is too large to generate in one go. Split into multiple parts.
console.log('History topics structure:', JSON.stringify(historyTopics, null, 2));
console.log(`Total topics: ${historyTopics.length}`);
console.log(`Total subtopics: ${historyTopics.reduce((sum, t) => sum + t.subtopics.length, 0)}`);
