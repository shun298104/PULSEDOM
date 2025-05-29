// src/rules/generators/AflCustomRule.ts
import { GraphControlRule } from '../GraphControlTypes';
import { GraphEngine } from '../../engine/GraphEngine';

/**
 * AFLカスタムルール（bpm/伝導比カスタム）
 * @param f AFL周波数 (bpm, 例: 300)
 * @param ratio 伝導比 (整数, 例: 2 → 2:1)
 * @returns GraphControlRule
 */
export const Afl: GraphControlRule = {
  id: 'AFL',
  label: 'Atrial Flutter',
  group: 'sinus_status',
  exclusiveGroup: 'AtrialArrhythmia',
  description: 'Blocks A→IA and applies probabilistic conduction from IA to AN. SA node suppressed.',
  updateGraph: updateGraphWithAflCustomArgs,
  effects: {
    node: {
      SA: { autofire: false },
      IA: { forceFiring: true },
      CTI2: { forceFiring: true },
      His: { refractory: 150}
    },
    path: {
      'A->IA': { block: true },
      'A->IA_retro': { block: true },
      'IA->CTI1': { block: false },
    },
  },
  uiControls: [
    {
      type: 'slider',
      key: 'fWaveFreq',
      label: 'F-wave frequency',
      min: 250,
      max: 350,
      step: 10,
      defaultValue: 300,
    },
    {
      type: 'slider',
      key: 'fWaveAmp',
      label: 'F-wave amplitude',
      min: 0.0,
      max: 0.2,
      step: 0.02,
      defaultValue: 0.04,
    },
    {
      type: 'slider',
      key: 'conductProb',
      label: 'AV Conduction Level',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
      tooltip: '💡Higher Levels increases AV node conduction',
    },
  ],
}


export function updateGraphWithAflCustomArgs(args: Record<string, number>, graph: GraphEngine) {
  const f = args.fWaveFreq;
  const a = args.fWaveAmp;
  const p = args.conductProb;
  const delayMs = Math.floor(1000 / (f / 60) / 5) ;
  console.log("[AflCustom]", f, a, p, delayMs);

  // Graph内でパス取得してパラメータ更新
//  graph.getPath('CTI2->IA')?.setDelay(delayMs * 3 - 6); // apdMs, polarityも値を指定
//  graph.getPath('IA->CTI2')?.setDelay(delayMs * 2 - 4);

  graph.getPath('CTI2->IA')?.setAmplitude(a); // apdMs, polarityも値を指定
  graph.getPath('IA->CTI2')?.setAmplitude(a);

  graph.getPath('IA->AN_fast')?.setRefractoryMs(3000/(p+3));
  graph.getPath('IA->AN_slow')?.setRefractoryMs(7000/(p+2));
}
