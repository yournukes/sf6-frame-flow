import { CharacterData, Move } from './types';

export const INITIAL_MOVES_RYU: Move[] = [
  {
    id: 'ryu-lp',
    name: '立ち弱P',
    command: 'LP',
    type: 'normal',
    damage: 300,
    frames: { startup: 4, active: 3, onHit: 4, onBlock: -2 },
    tags: ['暴れ'],
    notes: 'ラッシュ止めなどに。'
  },
  {
    id: 'ryu-mp',
    name: '立ち中P',
    command: 'MP',
    type: 'normal',
    damage: 600,
    frames: { startup: 6, active: 3, onHit: 7, onBlock: 1 },
    tags: ['有利'],
    notes: '固めの要。ヒット時はしゃがみ中Pなどが繋がる。'
  },
  {
    id: 'ryu-hp',
    name: '立ち強P',
    command: 'HP',
    type: 'normal',
    damage: 800,
    frames: { startup: 10, active: 3, onHit: 2, onBlock: -3 },
    tags: ['パニカン'],
    notes: '大ゴス。パニッシュカウンター始動に。'
  },
  {
    id: 'ryu-cr-mk',
    name: 'しゃがみ中K',
    command: '2MK',
    type: 'normal',
    damage: 500,
    frames: { startup: 7, active: 3, onHit: 2, onBlock: -4 },
    tags: ['下段'],
    notes: 'ラッシュキャンセル可能。'
  },
  {
    id: 'ryu-hadoken',
    name: '波動拳',
    command: '236P',
    type: 'special',
    damage: 600,
    frames: { startup: 14, active: -1, onHit: -2, onBlock: -6 },
    tags: ['飛び道具'],
    notes: '遠距離での牽制。'
  },
  {
    id: 'ryu-shoryu',
    name: '昇龍拳 (強)',
    command: '623HP',
    type: 'special',
    damage: 1400,
    frames: { startup: 6, active: 10, onHit: 'KD', onBlock: -25 },
    tags: ['対空', '無敵'],
    notes: '信頼できる対空技。'
  }
];

export const INITIAL_MOVES_BLANKA: Move[] = [
  {
    id: 'blk-lp',
    name: '立ち弱P',
    command: 'LP',
    type: 'normal',
    damage: 300,
    frames: { startup: 4, active: 3, onHit: 4, onBlock: -2 },
    tags: ['暴れ'],
    notes: 'リーチ長めの小技。'
  },
  {
    id: 'blk-mk',
    name: '立ち中K',
    command: 'MK',
    type: 'normal',
    damage: 700,
    frames: { startup: 9, active: 4, onHit: 3, onBlock: -4 },
    tags: ['牽制'],
    notes: 'キャンセル不可だが長い。'
  },
  {
    id: 'blk-hp',
    name: '立ち強P',
    command: 'HP',
    type: 'normal',
    damage: 800,
    frames: { startup: 10, active: 3, onHit: 1, onBlock: -3 },
    tags: ['パニカン'],
    notes: 'パニカン時膝崩れ。'
  },
  {
    id: 'blk-elec',
    name: 'エレクトリックサンダー(弱)',
    command: '214LP',
    type: 'special',
    damage: 800,
    frames: { startup: 10, active: 4, onHit: 3, onBlock: -3 },
    tags: ['固め'],
    notes: 'ガードされても反撃を受けにくい。'
  },
  {
    id: 'blk-roll',
    name: 'ローリングアタック(強)',
    command: '4~6HP',
    type: 'special',
    damage: 1200,
    frames: { startup: 15, active: 15, onHit: 'KD', onBlock: -15 },
    tags: ['突進'],
    notes: '遠距離ヒットなら反撃なし。'
  },
  {
    id: 'blk-sa2',
    name: 'ライトニングビースト',
    command: '236236K',
    type: 'super',
    damage: 0,
    frames: { startup: 0, active: 0, onHit: 0, onBlock: 0 },
    tags: ['強化', 'セットプレイ'],
    notes: 'Year3でも猛威を振るう最強のインストールSA。'
  }
];

export const INITIAL_DATA: CharacterData[] = [
  {
    id: 'ryu',
    name: 'リュウ',
    masterTags: ['ダウン', '暴れ', '有利', 'パニカン', '下段', '牽制', '飛び道具', '対空', '無敵', '安全飛び', '柔道'],
    moves: INITIAL_MOVES_RYU,
    situations: [
      {
        id: 'ryu-sit-1',
        name: '前投げ (中央)',
        description: '中央での前投げ後。ラッシュで起き攻めへ。',
        advantage: 20,
        tags: ['ダウン']
      }
    ],
    combos: [
      {
        id: 'ryu-bnk-1',
        name: '基本確反',
        starterId: 'ryu-hp',
        steps: [{ moveId: 'ryu-cr-mk' }, { moveId: 'ryu-hadoken' }],
        totalDamage: 1900,
        meterCost: 0,
        endSituationAdvantage: 4,
        tags: [],
        notes: 'ノーゲージ基本コンボ。'
      }
    ],
    okizeme: [
      {
        id: 'ryu-oki-1',
        name: '詐欺飛びルート',
        type: 'okizeme',
        minAdvantage: 41,
        maxAdvantage: 42,
        description: '最速前ジャンプ攻撃で4F暴れをガード可能。',
        afterAdvantage: 10,
        tags: ['安全飛び']
      },
      {
        id: 'ryu-oki-2',
        name: 'シミー(下がり打撃)',
        type: 'okizeme',
        minAdvantage: 3,
        maxAdvantage: 5,
        description: '投げ抜け狩り。',
        afterAdvantage: 4,
        tags: ['柔道']
      }
    ]
  },
  {
    id: 'blanka',
    name: 'ブランカ (Year3)',
    masterTags: ['ダウン', '暴れ', '牽制', 'パニカン', '固め', '突進', '強化', 'セットプレイ', 'わからん殺し'],
    moves: INITIAL_MOVES_BLANKA,
    situations: [
      {
        id: 'blk-sit-1',
        name: '強ローリング Hit',
        description: '画面中央でヒットした後',
        advantage: 25,
        tags: ['ダウン']
      }
    ],
    combos: [
      {
        id: 'blk-cmb-1',
        name: '基本弱コンボ',
        starterId: 'blk-lp',
        steps: [{moveId: 'blk-elec'}],
        totalDamage: 1100,
        meterCost: 0,
        endSituationAdvantage: 3,
        tags: [],
        notes: '暴れつぶし兼基本コンボ'
      },
      {
        id: 'blk-cmb-2',
        name: 'SA2発動コンボ',
        starterId: 'blk-hp',
        steps: [{moveId: 'blk-sa2'}, {moveId: 'blk-roll'}],
        totalDamage: 2500,
        meterCost: 2,
        endSituationAdvantage: 45,
        tags: ['ダウン'],
        notes: 'SA2発動からローリング派生でセットプレイへ'
      }
    ],
    okizeme: [
       {
        id: 'blk-oki-1',
        name: '人形設置セットプレイ',
        type: 'okizeme',
        minAdvantage: 40,
        maxAdvantage: 60,
        description: 'ブランカちゃん人形を設置して中下段の二択',
        afterAdvantage: 20,
        tags: ['わからん殺し']
      }
    ]
  }
];