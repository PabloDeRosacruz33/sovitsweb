export enum ReferenceVocalModes {
  singing = "singing",
  rappingTalking = "rappingTalking",
}

export enum F0Method {
  dio = "dio",
  crepe = "crepe",
  crepeTiny = "crepe-tiny",
  parselmouth = "parselmouth",
  harvest = "harvest",
}

export enum ModelVals {
  kanye = "kanye",
  juiceWrld = "juiceWrld",
  doom = "doom",
  biggie = "biggie",
  mccartney = "mccartney",
  drake = "drake",
  weeknd = "weeknd",
  rihanna = "rihanna",
  michaelJackson = "michaelJackson",
  freddyMercury = "freddyMercury",
  ariana = "ariana",
}

export interface Model {
  name: string;
  creator: string;
  steps: string;
  modelVal: ModelVals;
}

export interface InferenceParams {
  model: ModelVals;
  pitch_predict: boolean;
  transpose: number;
  f0_method: F0Method;
  noise_scale: number;
}
