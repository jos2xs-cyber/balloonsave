import type { CompanionConfig } from '../types'

export const COMPANIONS: CompanionConfig[] = [
  {
    id: 'dad',
    name: 'Dad',
    emoji: '👨',
    encouragements: [
      'WOAH! You got it!',
      'YOU\'RE AMAZING!',
      'KEEP GOING SUPERSTAR!',
      'DAD IS SO PROUD!',
    ],
  },
  {
    id: 'mom',
    name: 'Mom',
    emoji: '👩',
    encouragements: [
      'Wonderful job!',
      'You\'re so clever!',
      'I knew you could do it!',
      'Mom loves watching you play!',
    ],
  },
  {
    id: 'grandpa',
    name: 'Grandpa',
    emoji: '👴',
    encouragements: [
      'Well I never! Amazing!',
      'In all my years... wow!',
      'You\'re the best rescuer ever!',
      'Grandpa is cheering for you!',
    ],
  },
  {
    id: 'grandma',
    name: 'Grandma',
    emoji: '👵',
    encouragements: [
      'Oh my goodness, magical!',
      'You have the most special powers!',
      'Grandma is so proud of you!',
      'A true parade hero!',
    ],
  },
]
