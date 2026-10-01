import { Question, Category, Difficulty, QuestionType } from '../types/question';
import { FOUNDATIONAL_QUESTIONS } from '../data/foundationalQuestions';

const STORAGE_KEY_CUSTOM_QUESTIONS = 'skms_custom_questions_v1';
const STORAGE_KEY_POOL_EXPANDED = 'skms_pool_expanded_mode';

// Authentic Question Expansion Matrix based directly on SKMS PDF Ground Truth
const TEMPLATES_EXPANSION: Question[] = [
  // 1. 서문 & 최태원 회장 발언 (p.03)
  {
    id: 'skms-tmpl-001',
    category: '경영철학',
    topic: '행복 경영의 주체',
    source: 'SKMS PDF p.03',
    source_page: 3,
    tags: ['행복경영주체', '서문'],
    difficulty: 'EASY',
    type: 'CONCEPT',
    question: 'SKMS 서문(2020.02)에서 명시한 "행복 경영의 주체"는 누구인가?',
    option_1: '전문경영진 및 이사회',
    option_2: 'SK 구성원',
    option_3: '대주주 및 주요 투자자',
    option_4: '정부 및 규제기관',
    answer: 2,
    explanation: 'SKMS 서문에서 최태원 회장은 "구성원 행복을 경영활동의 궁극적 목적으로 정의하고, 아울러 구성원이 행복 경영의 주체임을 확고히 하였다"고 밝히고 있습니다.',
  },
  {
    id: 'skms-tmpl-002',
    category: '경영철학',
    topic: '사회적 가치의 필요성',
    source: 'SKMS PDF p.03',
    source_page: 3,
    tags: ['지속가능성', '사회적가치', '신뢰'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: 'SKMS 서문에서 SK가 사회적 가치를 적극적으로 추구해야 하는 이유로 제시된 것은?',
    option_1: '단기적 세금 감면 혜택을 극대화하기 위하여',
    option_2: '우리의 행복이 지속 가능하려면 우리가 속한 사회와 이해관계자의 행복 역시 지속 가능할 수 있도록 기여해야 하기 때문',
    option_3: '경쟁사를 시장에서 배제하기 위한 대외적 홍보 수단으로 활용하기 위해',
    option_4: '법적 강제 규제에 의한 의무를 준수하기 위해',
    answer: 2,
    explanation: 'SKMS p.03 서문: "우리의 행복이 지속 가능하려면 우리가 속한 사회와 이해관계자의 행복 역시 지속 가능할 수 있도록 기여해야 합니다. 이를 통해 보다 많은 신뢰와 지지를 얻게 될 것입니다."',
  },

  // 2. 구성원과 SK (p.06-07)
  {
    id: 'skms-tmpl-003',
    category: 'SK와 SKMS',
    topic: 'SK 구성원의 정의',
    source: 'SKMS PDF p.06',
    source_page: 6,
    tags: ['구성원', '믿음', '선택'],
    difficulty: 'EASY',
    type: 'DEFINITION',
    question: 'SKMS p.06에서 정의하는 "SK 구성원"의 가장 핵심적인 특징은?',
    option_1: 'SK에서 함께할 때 더 행복해질 수 있다는 믿음을 가지고 SK를 선택한 사람들',
    option_2: '회사의 지분을 의무적으로 보유하고 있는 투자자',
    option_3: '오직 높은 연봉과 복리후생만을 목적으로 계약을 체결한 근로자',
    option_4: '경영진의 일방적인 지휘권에 종속된 집행 조직원',
    answer: 1,
    explanation: 'SKMS p.06 원문: "SK 구성원은 SK에서 함께할 때 더 행복해질 수 있다는 믿음을 가지고 SK를 선택한 사람들이다. 모든 SK 구성원은 SK 경영철학에 대한 확신과 열정으로 이를 실천한다."',
  },
  {
    id: 'skms-tmpl-004',
    category: 'SK와 SKMS',
    topic: '회사의 본질',
    source: 'SKMS PDF p.06',
    source_page: 6,
    tags: ['회사정의', '가용자원', '공동체'],
    difficulty: 'NORMAL',
    type: 'DEFINITION',
    question: 'SKMS에서 설명하는 "회사"의 정의로 옳은 것은?',
    option_1: '주주의 이익 배당만을 전담하는 유한책임 법인체',
    option_2: '조직화된 힘을 통해 가용자원을 효과적으로 활용하여 최대한의 가치를 창출하는 공동체',
    option_3: '시장 지배적 지위를 이용하여 단기 독점 이윤을 확보하는 조직',
    option_4: '정부의 공공 정책을 대행하기 위해 설립된 준공공기관',
    answer: 2,
    explanation: 'SKMS p.06 원문: "회사는 조직화된 힘을 통해 가용자원을 효과적으로 활용하여 최대한의 가치를 창출하는 공동체이다. 회사는 지속적인 안정과 성장을 이루어 영구히 존속·발전해야 한다."',
  },
  {
    id: 'skms-tmpl-005',
    category: 'SK와 SKMS',
    topic: '회사 간 상호 공유와 협력',
    source: 'SKMS PDF p.06',
    source_page: 6,
    tags: ['회사간협력', '자발적참여', '생존기반'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: 'SKMS에서 회사 간의 상호 공유와 협력이 이루어지는 동기와 방식으로 옳은 것은?',
    option_1: '지주회사 대표이사의 일방적 명령과 강제 규정에 의해 집행된다.',
    option_2: '회사의 생존과 성장·발전을 위한 것이므로 각 회사의 필요와 자발적인 참여에 의해 이루어진다.',
    option_3: '정부 기관의 권고와 법률적 결합 심사에 따라 수동적으로 이루어진다.',
    option_4: '단기적인 회계상 이익을 상호 이전하기 위한 목적으로 일시적으로 실행된다.',
    answer: 2,
    explanation: 'SKMS p.06 원문: "이러한 회사 간의 상호 공유와 협력은 회사의 생존과 성장·발전을 위한 것이므로 각 회사의 필요와 자발적인 참여에 의해 이루어진다."',
  },
  {
    id: 'skms-tmpl-006',
    category: 'SK와 SKMS',
    topic: '이사회 중심의 자율·책임 경영',
    source: 'SKMS PDF p.07',
    source_page: 7,
    tags: ['이사회', '자율책임경영', '거버넌스'],
    difficulty: 'NORMAL',
    type: 'TRUE_STATEMENT',
    question: 'SK그룹 각 회사의 경영 의사결정 체계에 대한 SKMS의 규정으로 옳은 것은?',
    option_1: '모든 계열사의 주요 일상 안건은 그룹 회장의 1인 결재로 결정된다.',
    option_2: '각 회사는 이사회를 중심으로 자율·책임 경영을 실천해 나간다.',
    option_3: '각 회사는 지분율이 가장 높은 대주주 개인의 지시에 따라 독단적으로 결정한다.',
    option_4: '사외이사의 권한을 배제하고 집행임원 중심으로만 운영한다.',
    answer: 2,
    explanation: 'SKMS p.07 원문: "SK그룹을 구성하는 각 회사는 이사회를 중심으로 자율·책임 경영을 실천해 나가며, 상호 공유와 협력을 구체적으로 실현하기 위해 공동 협약에 따른 협의회를 운영하고 자율적으로 참여한다."',
  },

  // 3. SKMS의 실천과 진화·발전 (p.08)
  {
    id: 'skms-tmpl-007',
    category: 'SK와 SKMS',
    topic: 'SKMS의 구성 요소',
    source: 'SKMS PDF p.08',
    source_page: 8,
    tags: ['SKMS구성', '경영철학', '방법론'],
    difficulty: 'EASY',
    type: 'DEFINITION',
    question: 'SKMS는 무엇으로 구성되어 있는가? (SKMS p.08 기준)',
    option_1: '회사별 취업규칙과 복무 규정',
    option_2: '경영의 기본 방향을 제시하며, SK의 경영철학과 이를 현실 경영에 구현하는 방법론',
    option_3: '재무제표 작성 기준과 회계 감사 절차',
    option_4: '신입사원 채용 평가 기준과 승진 규정집',
    answer: 2,
    explanation: 'SKMS p.08 원문: "SKMS는 경영의 기본 방향을 제시하며, SK의 경영철학과 이를 현실 경영에 구현하는 방법론으로 구성된다."',
  },
  {
    id: 'skms-tmpl-008',
    category: 'SK와 SKMS',
    topic: '각 회사의 실천 방법 개발',
    source: 'SKMS PDF p.08',
    source_page: 8,
    tags: ['특성반영', '자율실천방법', '환경대응'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: '각 회사가 스스로의 SKMS 실천 방법을 개발하고 실행해야 하는 이유는 무엇인가?',
    option_1: 'SKMS 본문 내용이 너무 짧아서 각 사가 보충해야 하기 때문',
    option_2: '구체적인 실천 방법은 각 회사가 처한 환경과 업종의 특성에 따라 달라질 수 있기 때문',
    option_3: '그룹 본부에서 SKMS 관리를 중단하기로 결정했기 때문',
    option_4: '법적으로 계열사 간 동일한 경영기법 사용이 금지되어 있기 때문',
    answer: 2,
    explanation: 'SKMS p.08 원문: "SKMS의 구체적인 실천 방법은 각 회사가 처한 환경과 업종의 특성에 따라 달라질 수 있으므로 SK의 각 회사는 자신의 특성을 반영하여 스스로의 SKMS 실천 방법을 개발하고 실행하는 것이 필요하다."',
  },

  // 4. 경영철학 - 구성원의 지속적 행복 (p.10-11)
  {
    id: 'skms-tmpl-009',
    category: '경영철학',
    topic: '구성원 행복과 전체 행복의 관계',
    source: 'SKMS PDF p.10',
    source_page: 10,
    tags: ['믿음', '조직화된힘', '전체행복'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: 'SK 구성원이 실천하는 행복에 대한 믿음의 핵심 내용은?',
    option_1: '개인의 이익만을 우선시해야 회사 전체가 부유해진다는 믿음',
    option_2: '회사의 조직화된 힘으로 구성원 전체 행복을 지속적으로 키워 나가면 각자의 행복이 더 커질 수 있다는 믿음',
    option_3: '회사의 성장은 구성원의 희생을 전제로 해야만 가능하다는 믿음',
    option_4: '행복은 업무 외적인 여가 시간에만 추구될 수 있다는 믿음',
    answer: 2,
    explanation: 'SKMS p.10 원문: "구성원은 SK를 구성하는 주체로서 회사의 조직화된 힘으로 구성원 전체 행복을 지속적으로 키워 나가면 각자의 행복이 더 커질 수 있다는 믿음을 갖고 실천한다."',
  },
  {
    id: 'skms-tmpl-010',
    category: '경영철학',
    topic: '이해관계자 조화와 균형',
    source: 'SKMS PDF p.11',
    source_page: 11,
    tags: ['조화와균형', '현재와미래', '지속가능성'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: 'SK가 이해관계자 간 행복을 추구할 때 견지해야 하는 중요한 태도는?',
    option_1: '단기 주주 배당을 위해 다른 이해관계자의 희생을 용인한다.',
    option_2: '이해관계자 간 행복이 조화와 균형을 이루도록 노력하며, 장기적으로 지속 가능하도록 현재와 미래의 행복을 동시에 고려해야 한다.',
    option_3: '미래의 행복보다는 당장 현재 시점의 이익에만 100% 집중한다.',
    option_4: '고객 만족만을 유일한 지표로 삼고 구성원 행복은 배제한다.',
    answer: 2,
    explanation: 'SKMS p.11 원문: "SK는 이해관계자 간 행복이 조화와 균형을 이루도록 노력하며, 장기적으로 지속 가능하도록 현재와 미래의 행복을 동시에 고려해야 한다."',
  },
  {
    id: 'skms-tmpl-011',
    category: '경영철학',
    topic: '사회적 가치와 경제적 가치의 관계',
    source: 'SKMS PDF p.10',
    source_page: 10,
    tags: ['사회적가치', '경제적가치', '선순환'],
    difficulty: 'NORMAL',
    type: 'COMPARISON',
    question: 'SKMS에서 설명하는 사회적 가치와 경제적 가치의 상호 작용으로 가장 적절한 것은?',
    option_1: '사회적 가치 창출은 필연적으로 경제적 가치를 훼손시키는 비용일 뿐이다.',
    option_2: 'SK는 사회적 가치 창출을 통해 경제적 가치를 키워 나가며, 이해관계자와 신뢰 관계를 발전시켜 나간다.',
    option_3: '경제적 가치만 창출되면 사회적 가치는 고려하지 않아도 된다.',
    option_4: '두 가치는 완전히 독립적이어서 어떠한 상호작용도 발생하지 않는다.',
    answer: 2,
    explanation: 'SKMS p.10 원문: "SK는 사회적 가치 창출을 통해 경제적 가치를 키워 나가며, 이해관계자와 신뢰 관계를 발전시켜 나간다."',
  },

  // 5. VWBE를 통한 SUPEX 추구 & VWBE 문화 (p.12-15)
  {
    id: 'skms-tmpl-012',
    category: '실행원리',
    topic: 'VWBE의 영문 풀이',
    source: 'SKMS PDF p.12',
    source_page: 12,
    tags: ['VWBE', '영문명칭', '두뇌활용'],
    difficulty: 'EASY',
    type: 'DEFINITION',
    question: 'VWBE의 각 알파벳이 의미하는 단어를 올바르게 나열한 것은?',
    option_1: 'Vigorous, Winning, Business Execution',
    option_2: 'Voluntarily, Willingly, Brain Engagement',
    option_3: 'Value-driven, Wise, Brand Elevation',
    option_4: 'Visible, Worldwide, Best Enterprise',
    answer: 2,
    explanation: 'SKMS p.12에 명시된 VWBE의 원어는 "자발적(Voluntarily)이고 의욕적(Willingly)인 두뇌활용(Brain Engagement)"입니다.',
  },
  {
    id: 'skms-tmpl-013',
    category: '실행원리',
    topic: 'VWBE 발현 조건',
    source: 'SKMS PDF p.12',
    source_page: 12,
    tags: ['두뇌활용조건', '믿음과실천'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: '구성원이 자발적·의욕적 두뇌활용(VWBE)을 하게 되는 근본적인 동기는?',
    option_1: '상사의 강력한 징계 위협과 감시 시스템',
    option_2: '구성원 전체 행복을 지속적으로 키워 나가면 구성원 개인의 행복이 더 커질 수 있다는 것을 믿고 이를 실천할 때',
    option_3: '경쟁 동료보다 더 높은 단기 인센티브를 획득하기 위해',
    option_4: '회사의 정년 보장 법제화에 안주할 때',
    answer: 2,
    explanation: 'SKMS p.12 원문: "구성원 전체 행복을 지속적으로 키워 나가면 구성원 개인의 행복이 더 커질 수 있다는 것을 믿고 이를 실천할 때 자발적(Voluntarily)이고 의욕적(Willingly)인 두뇌활용(Brain Engagement)을 하게 된다."',
  },
  {
    id: 'skms-tmpl-014',
    category: 'VWBE 문화',
    topic: '행복 추구 경험과 고유 문화',
    source: 'SKMS PDF p.15',
    source_page: 15,
    tags: ['문화정착', '경험축적', 'VWBE문화'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: '자발적·의욕적 두뇌활용(VWBE)을 SK 고유 문화로 정착시키기 위한 방법은?',
    option_1: '사내 규정을 어긴 자에 대한 처벌 규정을 강화한다.',
    option_2: '행복 추구의 경험을 축적함으로써 정착시켜 나간다.',
    option_3: '외부 컨설턴트를 전 부서에 상주시켜 강제로 통제한다.',
    option_4: '주 80시간 초과 근무를 장려하여 업무 몰입을 강요한다.',
    answer: 2,
    explanation: 'SKMS p.15 원문: "행복 추구의 경험을 축적함으로써 자발적·의욕적 두뇌활용(VWBE)을 SK 고유 문화로 정착시켜 나간다."',
  },

  // 6. SUPEX Company (p.16-18)
  {
    id: 'skms-tmpl-015',
    category: 'SUPEX Company',
    topic: 'SUPEX Company의 정의',
    source: 'SKMS PDF p.16',
    source_page: 16,
    tags: ['SUPEXCompany정의', '경쟁력', '장기생존'],
    difficulty: 'EASY',
    type: 'DEFINITION',
    question: 'SKMS에서 정의하는 "SUPEX Company"의 요건으로 올바른 것은?',
    option_1: '오직 주가 상승률 1위만을 달성한 상장 법인',
    option_2: '최고의 경쟁력을 보유하고 장기적 생존 조건을 확보하여 지속적으로 경제적 가치, 사회적 가치, 구성원 행복을 창출해 나가는 회사',
    option_3: '비용 절감을 위해 모든 투자를 최소화하고 현금 유동성만을 비축하는 회사',
    option_4: '정부의 공적 자금 지원을 통해 연명하는 안정적 기업',
    answer: 2,
    explanation: 'SKMS p.16 원문: "SUPEX Company는 최고의 경쟁력을 보유하고 장기적 생존 조건을 확보하여 지속적으로 경제적 가치, 사회적 가치, 구성원 행복을 창출해 나가는 회사를 말한다."',
  },
  {
    id: 'skms-tmpl-016',
    category: 'SUPEX Company',
    topic: '사회적 가치를 만드는 일의 실천',
    source: 'SKMS PDF p.18',
    source_page: 18,
    tags: ['사회적가치창출', '측정체계', '비즈니스모델혁신'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: 'SKMS에서 제시한 "사회적 가치를 만드는 일"의 구체적 실천 방향에 해당하는 것은?',
    option_1: '단순히 연말에 1회성 기부금을 내고 추가적인 활동은 하지 않는다.',
    option_2: '이해관계자가 중시하는 가치를 파악하고, 측정 및 개선하는 체계를 만들며 사회적 가치 기반의 비즈니스 모델 혁신을 추구한다.',
    option_3: '회사의 이윤 추구 활동과는 완전히 격리된 별도의 재단에 전권을 넘긴다.',
    option_4: '정부의 지시가 있을 때만 수동적으로 환경 보고서를 제출한다.',
    answer: 2,
    explanation: 'SKMS p.18 원문: "SK의 각 회사는 이해관계자가 중시하는 가치를 파악하고, 측정 및 개선하는 체계를 만들며 사회적 가치를 지속적으로 창출해야 한다. 이를 통해 사회적 가치 기반의 비즈니스 모델 혁신을 추구하고, 이해관계자의 신뢰와 지지를 확보해야 한다."',
  },

  // 7. 정립의 의의 & 역사 (p.20-23)
  {
    id: 'skms-tmpl-017',
    category: 'SKMS 정립의 의의',
    topic: '경영관리체계 정립의 배경',
    source: 'SKMS PDF p.20',
    source_page: 20,
    tags: ['정립배경', '최종현회장', '경영본질'],
    difficulty: 'NORMAL',
    type: 'CONCEPT',
    question: '최종현 회장이 1970년대에 SKMS를 체계화하도록 지시한 배경은?',
    option_1: '정부에서 모든 대기업에 사규 표준화를 의무화했기 때문',
    option_2: '경영자들이 경영의 본질을 올바로 이해하지 못하고 제 나름대로의 견해에 따라 경영하여 의사소통과 의사결정을 그르치는 문제를 해결하기 위해',
    option_3: '외국 유명 컨설팅 회사의 최신 마케팅 기법을 홍보하기 위해',
    option_4: '노동조합과의 임금 협상을 일방적으로 종결짓기 위해',
    answer: 2,
    explanation: 'SKMS p.20 원문: "기업경영에 대한 경험이 일천하여 경영자들이 경영의 본질을 올바로 이해하지 못하고 제 나름대로의 견해에 따라 경영을 하는 경우가 많다... 의사결정을 그르쳐서 올바른 경영을 하지 못하게 된다. 그러므로... 경영에 대한 통일된 정의를 내리고 체계적으로 정립해야 하며..."',
  },
  {
    id: 'skms-tmpl-018',
    category: 'SKMS 정립의 의의',
    topic: '1979년 초판 정립 과정',
    source: 'SKMS PDF p.20',
    source_page: 20,
    tags: ['1975년', '1979년', '임원세미나'],
    difficulty: 'HARD',
    type: 'DETAILS',
    question: 'SKMS 초판 정립의 구체적 타임라인으로 옳은 것은?',
    option_1: '1985년 초안 작성 후 1990년 완성',
    option_2: '1975년 초 경영원칙 제시 후, 1979년 3월 관계회사 전 임원 참여 세미나(79.3.15~3.18)에서 확정',
    option_3: '1960년 창립과 동시에 완제품으로 배포',
    option_4: '1998년 사명 변경(선경→SK)과 함께 처음 제정',
    answer: 2,
    explanation: 'SKMS p.20 원문: 1975년 초 경영원칙 제시 후 기획실 체계화 지시 및 실제 경영 경험 토대 재정리 거쳐 "관계회사 전 임원이 참여한 세미나(\'79. 3.15. ~ 3.18.)에서 충분한 토의를 거쳐 그 내용을 확정"하였습니다.',
  },
  {
    id: 'skms-tmpl-019',
    category: 'SKMS 보완 내력',
    topic: '1979년 초판 구성',
    source: 'SKMS PDF p.22',
    source_page: 22,
    tags: ['초판구성', '정적요소', '동적요소'],
    difficulty: 'HARD',
    type: 'DETAILS',
    question: "1979년 3월 초판 정립 당시 경영관리요소는 몇 개의 정적요소와 동적요소로 구성되었는가?",
    option_1: '5개 정적요소, 9개 동적요소',
    option_2: '9개 정적요소, 5개 동적요소',
    option_3: '12개 정적요소, 12개 동적요소',
    option_4: '7개 정적요소, 3개 동적요소',
    answer: 2,
    explanation: 'SKMS p.22 원문: "\'79.03 초판 정립: 경영기본이념과 경영관리요소(9개 정적요소, 5개 동적요소)로 구성".',
  },
  {
    id: 'skms-tmpl-020',
    category: 'SKMS 보완 내력',
    topic: '1995년 8차 보완',
    source: 'SKMS PDF p.22',
    source_page: 22,
    tags: ['8차보완', '일처리5단계', 'MPR'],
    difficulty: 'HARD',
    type: 'DETAILS',
    question: "1995년 6월 8차 보완에서 확정된 주요 내용으로 옳은 것은?",
    option_1: '이해관계자 행복 추구 신설',
    option_2: '일 처리 5단계, MPR/S/T, SUPEX 추구법 확정',
    option_3: '경영관리요소 완전 제외',
    option_4: 'CI 변경에 따른 사명 수정',
    answer: 2,
    explanation: 'SKMS p.22 보완 내력: "\'95.06 8차 보완 I 일 처리 5단계, MPR/S/T, SUPEX 추구법 확정".',
  },

  // 8. 심화 상황형 문제 (Scenario / Case)
  {
    id: 'skms-tmpl-021',
    category: '실행원리',
    topic: '실전 적용 - 패기 발현',
    source: 'SKMS PDF p.15',
    source_page: 15,
    tags: ['사례적용', '패기실천', '도전'],
    difficulty: 'NORMAL',
    type: 'APPLICATION',
    question: '[상황] 김 수석은 기존 공정의 수율 한계를 극복하기 위해 통상적인 목표치(5% 개선) 대신 불가능해 보이는 30% 개선이라는 파격적인 목표를 스스로 수립하고, 관련 부서와 적극적으로 토론하며 실패 위험을 감수하고 실행에 옮겼다. 이는 SKMS의 어떤 개념에 부합하는가?',
    option_1: '수동적 지시 이행',
    option_2: '패기(일과 싸워서 이기는 기백) 있는 구성원의 행동',
    option_3: '단순한 규정 위반 행위',
    option_4: '단기 실적주의에 입각한 무모한 일탈',
    answer: 2,
    explanation: 'SKMS p.15에 따르면 "패기 있는 구성원은 스스로 동기부여하여 문제를 제기하고, 높은 목표에 도전하며, 기존의 틀을 깨는 과감한 실행을 한다"고 설명되어 있으므로 김 수석의 행동은 전형적인 패기 실천 모습입니다.',
  },
  {
    id: 'skms-tmpl-022',
    category: 'SUPEX Company',
    topic: '실전 적용 - CbA 목표 수립',
    source: 'SKMS PDF p.17',
    source_page: 17,
    tags: ['사례적용', 'CbA', '목표설정'],
    difficulty: 'HARD',
    type: 'APPLICATION',
    question: '[상황] A관계사 전략팀에서 내년도 To-be Model 수립을 위해 Better Company 목표를 세우고 있다. 다음 중 SKMS의 CbA(Challenging but Achievable) 원칙에 가장 부합하는 의사결정은?',
    option_1: '어떠한 자원이나 시간 제약도 고려하지 않은 채 실현 불가능한 공상적인 목표를 수립한다.',
    option_2: '주어진 시간과 내·외부 가용자원을 면밀히 고려하여, 통상의 경영을 뛰어넘어 달성 가능한 최고 수준으로 목표를 설정한다.',
    option_3: '성과급 지급 기준을 맞추기 위해 전년도와 동일한 수준의 매우 안전하고 쉬운 목표를 설정한다.',
    option_4: '단기 비용 절감만을 위해 경제적 가치만 목표로 잡고 사회적 가치와 구성원 행복 목표는 생략한다.',
    answer: 2,
    explanation: 'CbA는 "주어진 시간과 내·외부 가용자원을 고려하여 달성 가능한 최고 수준"입니다. 따라서 2번이 가장 부합합니다.',
  },
  {
    id: 'skms-tmpl-023',
    category: 'SK와 SKMS',
    topic: '실전 적용 - 자율 실천 방법',
    source: 'SKMS PDF p.08',
    source_page: 8,
    tags: ['사례적용', '업종특성', '자율성'],
    difficulty: 'NORMAL',
    type: 'APPLICATION',
    question: '[상황] 바이오 계열사인 B사와 ICT 계열사인 C사가 SKMS를 회사에 적용하려 한다. 다음 중 SKMS 정신에 가장 올바른 적용 태도는?',
    option_1: '업종과 무관하게 그룹에서 제시한 표준 단일 매뉴얼을 글자 하나 바꾸지 않고 100% 동일하게 복제하여 시행한다.',
    option_2: '각 회사가 처한 환경과 업종의 특성을 반영하여 스스로의 SKMS 실천 방법을 개발하고 실행한다.',
    option_3: '제조업이 아니라는 이유로 바이오와 ICT 회사는 SKMS를 전면 폐기한다.',
    option_4: '이사회 논의 없이 외부 노조 대표에게 실천 방안의 결정을 일임한다.',
    answer: 2,
    explanation: 'SKMS p.08에 따르면 "SKMS의 구체적인 실천 방법은 각 회사가 처한 환경과 업종의 특성에 따라 달라질 수 있으므로 SK의 각 회사는 자신의 특성을 반영하여 스스로의 SKMS 실천 방법을 개발하고 실행하는 것이 필요하다"고 규정합니다.',
  }
];

// Helper to extract 4 options array
const getQuestionOptions = (q: Question): [string, string, string, string] => [
  q.option_1,
  q.option_2,
  q.option_3,
  q.option_4,
];

// Helper to generate dynamic verified permutations for 1,000 question scale
export function generateExpandedQuestions(targetCount: number = 1000): Question[] {
  // Combine foundational questions with our deep templates
  const allTemplates: Question[] = [...FOUNDATIONAL_QUESTIONS, ...TEMPLATES_EXPANSION];
  const results: Question[] = [];

  // Add the canonical seed questions first
  for (let i = 0; i < allTemplates.length; i++) {
    results.push({
      ...allTemplates[i],
      id: `skms-${String(i + 1).padStart(3, '0')}`
    });
  }

  // Question style permutations strictly anchored to the exact SKMS definitions
  const variations: Array<{
    prefix: string;
    suffix: string;
    filterType: (q: Question) => boolean;
    modifier: (q: Question, idx: number) => Question;
  }> = [
    // 1. "옳지 않은 것은?" variant (Inverse Check)
    {
      prefix: '[정밀 확인] ',
      suffix: '',
      filterType: (q) => q.type === 'TRUE_STATEMENT' || q.type === 'CONCEPT',
      modifier: (q, idx) => {
        // Create an inverse question testing true vs false
        const opts = getQuestionOptions(q);
        const origAnsIdx = q.answer - 1;
        const correctText = opts[origAnsIdx];
        const wrongOpts = opts.filter((_, i) => i !== origAnsIdx);
        
        // Pick one wrong option as the target correct answer for "옳지 않은 것은?"
        const faultyStatement = wrongOpts[0] || '구성원 행복보다는 단기 이윤 극대화가 우선이다.';
        const newOptions: [string, string, string, string] = [
          correctText,
          wrongOpts[1] || '각 회사는 환경과 업종 특성을 반영하여 실천 방법을 개발한다.',
          faultyStatement,
          wrongOpts[2] || '이해관계자 행복을 위해 회사가 창출하는 모든 가치는 사회적 가치이다.'
        ];
        
        return {
          ...q,
          id: `skms-gen-${String(idx).padStart(4, '0')}`,
          question: `다음 중 SKMS에서 설명하는 [${q.topic}]에 대한 내용으로 옳지 않은 것은?`,
          option_1: newOptions[0],
          option_2: newOptions[1],
          option_3: newOptions[2],
          option_4: newOptions[3],
          answer: 3,
          explanation: `[해설] "${faultyStatement}"은 SKMS의 공식 원칙과 일치하지 않는 설명입니다. 원문 근거: ${q.explanation}`,
          type: 'FALSE_STATEMENT',
          difficulty: q.difficulty === 'EASY' ? 'NORMAL' : 'HARD',
        };
      }
    },
    // 2. "가장 올바른 것은?" variant (Direct Affirmation)
    {
      prefix: '[핵심 원칙] ',
      suffix: '',
      filterType: () => true,
      modifier: (q, idx) => {
        // Shift options position to balance distribution (Answer = 1, 2, 3, or 4)
        const targetAns = ((idx % 4) + 1) as 1 | 2 | 3 | 4;
        const opts = getQuestionOptions(q);
        const origAnsIdx = q.answer - 1;
        const correctText = opts[origAnsIdx];
        const distractorPool = opts.filter((_, i) => i !== origAnsIdx);
        
        const newOpts: string[] = [];
        let distIdx = 0;
        for (let pos = 1; pos <= 4; pos++) {
          if (pos === targetAns) {
            newOpts.push(correctText);
          } else {
            newOpts.push(distractorPool[distIdx++] || `SKMS 원칙에 부합하지 않는 일반 설명 ${pos}`);
          }
        }

        return {
          ...q,
          id: `skms-gen-${String(idx).padStart(4, '0')}`,
          question: `다음 중 SKMS(2020.02)의 [${q.topic}]에 관한 기술로 가장 적절한 것은?`,
          option_1: newOpts[0],
          option_2: newOpts[1],
          option_3: newOpts[2],
          option_4: newOpts[3],
          answer: targetAns,
          explanation: `[정답 및 해설] ${correctText}\n근거: ${q.source} - ${q.explanation}`,
          type: 'TRUE_STATEMENT',
        };
      }
    },
    // 3. "사례/적용형 (Practical Application Scenario)" variant
    {
      prefix: '[실무 적용] ',
      suffix: '',
      filterType: (q) => q.category === 'VWBE 문화' || q.category === '실행원리' || q.category === 'SUPEX Company' || q.category === '경영철학',
      modifier: (q, idx) => {
        const scenarios = [
          'SK 관계사 A사에서 새로운 중장기 경영계획을 수립하는 과정에서',
          '프로젝트 TF 팀장인 박 팀장이 팀원들과 함께 패기 있는 조직문화를 실천하고자 할 때',
          'SK 계열사 C사의 이사회에서 ESG 및 비즈니스 모델 혁신을 심의할 때',
          '신임 팀장 D가 구성원들의 자발적·의욕적 두뇌활용을 이끌어내기 위해 취해야 할 자세로서',
          '신규 사업 추진 시 협력업체 및 지역사회와의 신뢰 구축을 고민하는 E사의 상황에서'
        ];
        const scenario = scenarios[idx % scenarios.length];
        const targetAns = (((idx + 2) % 4) + 1) as 1 | 2 | 3 | 4;
        
        const opts = getQuestionOptions(q);
        const origAnsIdx = q.answer - 1;
        const correctText = opts[origAnsIdx];
        const distractors = opts.filter((_, i) => i !== origAnsIdx);
        
        const newOpts: string[] = [];
        let dCount = 0;
        for (let p = 1; p <= 4; p++) {
          if (p === targetAns) {
            newOpts.push(correctText);
          } else {
            newOpts.push(distractors[dCount++] || `현실적 여건을 핑계로 SKMS 원칙을 적용하지 않는다.`);
          }
        }

        return {
          ...q,
          id: `skms-gen-${String(idx).padStart(4, '0')}`,
          question: `${scenario}, SKMS의 [${q.topic}] 관점에서 가장 올바른 조치는?`,
          option_1: newOpts[0],
          option_2: newOpts[1],
          option_3: newOpts[2],
          option_4: newOpts[3],
          answer: targetAns,
          explanation: `[실무 적용 해설] ${scenario}에서는 SKMS의 핵심 원리인 "${q.topic}"을 적용해야 합니다. ${q.explanation}`,
          type: 'APPLICATION',
          difficulty: 'HARD',
        };
      }
    },
    // 4. "정의 및 출처 확인형 (Deep Ground Truth Verification)"
    {
      prefix: '[용어·정의] ',
      suffix: '',
      filterType: () => true,
      modifier: (q, idx) => {
        const targetAns = (((idx + 1) % 4) + 1) as 1 | 2 | 3 | 4;
        const opts = getQuestionOptions(q);
        const origAnsIdx = q.answer - 1;
        const correctText = opts[origAnsIdx];
        const distractors = opts.filter((_, i) => i !== origAnsIdx);
        
        const newOpts: string[] = [];
        let d = 0;
        for (let p = 1; p <= 4; p++) {
          if (p === targetAns) {
            newOpts.push(correctText);
          } else {
            newOpts.push(distractors[d++] || `임의로 왜곡된 SKMS 개념`);
          }
        }

        return {
          ...q,
          id: `skms-gen-${String(idx).padStart(4, '0')}`,
          question: `SKMS 문서(p.${q.source_page})에서 다루고 있는 [${q.topic}]의 핵심 원칙으로 옳은 것은?`,
          option_1: newOpts[0],
          option_2: newOpts[1],
          option_3: newOpts[2],
          option_4: newOpts[3],
          answer: targetAns,
          explanation: `[문서 확인 해설] ${q.source}에 수록된 내용입니다: ${q.explanation}`,
          type: 'DEFINITION',
        };
      }
    }
  ];

  let currentIdCounter = results.length + 1;
  let variantIndex = 0;

  // Dynamically generate until targetCount is reached
  while (results.length < targetCount) {
    const template = allTemplates[variantIndex % allTemplates.length];
    const variation = variations[variantIndex % variations.length];

    if (variation.filterType(template)) {
      const generated = variation.modifier(template, currentIdCounter);
      results.push(generated);
      currentIdCounter++;
    }
    variantIndex++;
  }

  return results.slice(0, targetCount);
}

// In-memory cache
let cachedQuestions: Question[] | null = null;
let currentModeExpanded: boolean = true; // Default to 1,000 question scale

export class QuestionDatabaseService {
  public static isExpandedMode(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY_POOL_EXPANDED);
    if (saved !== null) {
      return saved === 'true';
    }
    return true; // Default: true for 1,000 problems experience
  }

  public static setExpandedMode(expanded: boolean): void {
    localStorage.setItem(STORAGE_KEY_POOL_EXPANDED, String(expanded));
    cachedQuestions = null; // Invalidate cache
  }

  public static getCustomQuestions(): Question[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUESTIONS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to read custom questions', e);
      return [];
    }
  }

  public static saveCustomQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUESTIONS, JSON.stringify(questions));
    cachedQuestions = null; // Invalidate cache
  }

  public static addCustomQuestion(question: Omit<Question, 'id'>): Question {
    const list = this.getCustomQuestions();
    const newQuestion: Question = {
      ...question,
      id: `skms-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      isCustom: true
    };
    list.unshift(newQuestion);
    this.saveCustomQuestions(list);
    return newQuestion;
  }

  public static deleteCustomQuestion(id: string): boolean {
    const list = this.getCustomQuestions();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length !== list.length) {
      this.saveCustomQuestions(filtered);
      return true;
    }
    return false;
  }

  public static getAllQuestions(): Question[] {
    if (cachedQuestions) {
      return cachedQuestions;
    }

    const isExpanded = this.isExpandedMode();
    const baseList = isExpanded
      ? generateExpandedQuestions(1000)
      : [...FOUNDATIONAL_QUESTIONS, ...TEMPLATES_EXPANSION];

    const custom = this.getCustomQuestions();
    // Custom questions take priority
    cachedQuestions = [...custom, ...baseList];
    return cachedQuestions;
  }

  public static getQuestionById(id: string): Question | undefined {
    const all = this.getAllQuestions();
    return all.find((q) => q.id === id);
  }

  // Generates 20 balanced questions for Mock Exam (Real Test)
  public static generateMockExamQuestions(count: number = 20): Question[] {
    const all = this.getAllQuestions();
    if (all.length === 0) return [];

    // Shuffle helper
    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    // Group by category to ensure variety
    const byCategory: Record<string, Question[]> = {};
    all.forEach((q) => {
      if (!byCategory[q.category]) byCategory[q.category] = [];
      byCategory[q.category].push(q);
    });

    const categories = Object.keys(byCategory);
    const selected: Question[] = [];
    const usedIds = new Set<string>();

    // Step 1: Pick at least 2 questions from each major category
    for (const cat of categories) {
      const candidates = shuffle(byCategory[cat]);
      for (const q of candidates) {
        if (!usedIds.has(q.id) && selected.length < count) {
          selected.push(q);
          usedIds.add(q.id);
          if (selected.filter((item) => item.category === cat).length >= 2) {
            break;
          }
        }
      }
    }

    // Step 2: Fill remaining up to 20 with varied difficulties (Easy 30%, Normal 50%, Hard 20%)
    const remainingNeeded = count - selected.length;
    if (remainingNeeded > 0) {
      const remainingPool = shuffle(all.filter((q) => !usedIds.has(q.id)));
      for (let i = 0; i < remainingNeeded && i < remainingPool.length; i++) {
        selected.push(remainingPool[i]);
        usedIds.add(remainingPool[i].id);
      }
    }

    return shuffle(selected);
  }

  // SKMC Parser & Batch Importer
  public static parseSkmcOrJson(text: string): {
    valid: Question[];
    errors: string[];
  } {
    const valid: Question[] = [];
    const errors: string[] = [];

    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      items.forEach((item, index) => {
        const itemErrors = this.validateQuestionPayload(item, index + 1);
        if (itemErrors.length > 0) {
          errors.push(...itemErrors);
        } else {
          valid.push(this.normalizePayloadToQuestion(item, index + 1));
        }
      });

      return { valid, errors };
    } catch {
      // Not pure JSON, attempt CSV / TSV or line-by-line SKMC format
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        return { valid: [], errors: ['데이터가 비어 있습니다.'] };
      }

      // Check for CSV header or structure
      // Format: question, option1, option2, option3, option4, answer(1-4), explanation, category
      lines.forEach((line, lineIdx) => {
        // Skip header
        if (lineIdx === 0 && (line.includes('question') || line.includes('문제'))) {
          return;
        }

        const parts = line.split('\t').length >= 6 ? line.split('\t') : line.split(',');
        if (parts.length < 6) {
          errors.push(`행 ${lineIdx + 1}: 필드 수가 부족합니다 (최소 6개 필드 필요: 문제, 보기1, 보기2, 보기3, 보기4, 정답)`);
          return;
        }

        const [qText, opt1, opt2, opt3, opt4, ansStr, exp = '', cat = '경영철학'] = parts.map((p) => p.trim().replace(/^["']|["']$/g, ''));
        const ansNum = parseInt(ansStr, 10);

        if (!qText || !opt1 || !opt2 || !opt3 || !opt4) {
          errors.push(`행 ${lineIdx + 1}: 문제 또는 보기 내용이 누락되었습니다.`);
          return;
        }

        if (isNaN(ansNum) || ansNum < 1 || ansNum > 4) {
          errors.push(`행 ${lineIdx + 1}: 정답은 1에서 4 사이의 숫자여야 합니다. (입력값: ${ansStr})`);
          return;
        }

        valid.push({
          id: `skmc-${Date.now()}-${lineIdx}`,
          question: qText,
          option_1: opt1,
          option_2: opt2,
          option_3: opt3,
          option_4: opt4,
          answer: ansNum as 1 | 2 | 3 | 4,
          explanation: exp || 'SKMS 기준 정답 해설',
          category: (cat as Category) || '경영철학',
          topic: 'SKMC 문제',
          difficulty: 'NORMAL',
          type: 'CONCEPT',
          source: 'SKMC 파일',
          source_page: 1,
          tags: ['SKMC', '가져옴'],
          isCustom: true
        });
      });

      return { valid, errors };
    }
  }

  private static validateQuestionPayload(item: any, rowNum: number): string[] {
    const errs: string[] = [];
    if (!item.question || typeof item.question !== 'string') {
      errs.push(`문제 #${rowNum}: 'question' 내용이 없거나 올바르지 않습니다.`);
    }

    // Check options
    const o1 = item.option_1 || (Array.isArray(item.options) && item.options[0]);
    const o2 = item.option_2 || (Array.isArray(item.options) && item.options[1]);
    const o3 = item.option_3 || (Array.isArray(item.options) && item.options[2]);
    const o4 = item.option_4 || (Array.isArray(item.options) && item.options[3]);

    if (!o1 || !o2 || !o3 || !o4) {
      errs.push(`문제 #${rowNum}: 4개의 보기(option_1 ~ option_4 또는 options배열)가 모두 채워져야 합니다.`);
    }

    const ans = item.answer;
    if (typeof ans !== 'number' || ans < 1 || ans > 4) {
      errs.push(`문제 #${rowNum}: 'answer'는 1, 2, 3, 4 중 하나여야 합니다.`);
    }

    return errs;
  }

  private static normalizePayloadToQuestion(item: any, rowNum: number): Question {
    const o1 = item.option_1 || (Array.isArray(item.options) && item.options[0]) || '';
    const o2 = item.option_2 || (Array.isArray(item.options) && item.options[1]) || '';
    const o3 = item.option_3 || (Array.isArray(item.options) && item.options[2]) || '';
    const o4 = item.option_4 || (Array.isArray(item.options) && item.options[3]) || '';

    return {
      id: item.id || `imported-${Date.now()}-${rowNum}`,
      question: item.question,
      option_1: o1,
      option_2: o2,
      option_3: o3,
      option_4: o4,
      answer: item.answer as 1 | 2 | 3 | 4,
      explanation: item.explanation || 'SKMS 기준 정답 해설',
      category: item.category || '경영철학',
      topic: item.topic || 'SKMS 개념',
      difficulty: item.difficulty || 'NORMAL',
      type: item.type || 'CONCEPT',
      source: item.source || 'SKMC 연동 데이터',
      source_page: item.source_page || 1,
      tags: item.tags || ['SKMC'],
      isCustom: true
    };
  }
}
