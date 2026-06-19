/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Prediction = "Normal" | "Tuberculosis (TBC)" | "Pneumonia";

export interface Examination {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: "Laki-laki" | "Perempuan";
  height: number; // cm
  weight: number; // kg
  date: string;
  prediction: Prediction;
  confidence: number;
  imageUrl?: string;
  heatmapUrl?: string;
  notes?: string;
}
