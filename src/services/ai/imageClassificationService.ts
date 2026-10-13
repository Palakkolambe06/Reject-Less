import { ClassifiedResult, InferenceConfig, RawModelPrediction } from '../../types/ai';
import { mapModelPrediction, generateAiDisclaimer } from './predictionMapper';

class ImageClassificationService {
  /**
   * Classify waste material from an uploaded image file or base64 data URL
   */
  public async classifyImage(
    imageSource: File | string,
    config: InferenceConfig
  ): Promise<ClassifiedResult> {
    if (config.mode === 'open_weights_api' && config.apiToken) {
      return this.callHuggingFaceApi(imageSource, config);
    } else if (config.mode === 'custom_endpoint' && config.apiEndpoint) {
      return this.callCustomEndpoint(imageSource, config);
    } else {
      return this.runSimulation(imageSource, config);
    }
  }

  /**
   * Real Open-Weight Inference via Hugging Face Inference API
   * Model: yangy50/garbage-classification
   */
  private async callHuggingFaceApi(
    imageSource: File | string,
    config: InferenceConfig
  ): Promise<ClassifiedResult> {
    try {
      const endpoint =
        config.apiEndpoint ||
        `https://api-inference.huggingface.co/models/${config.modelId || 'yangy50/garbage-classification'}`;

      let imageBlob: Blob;
      if (typeof imageSource === 'string') {
        const response = await fetch(imageSource);
        imageBlob = await response.blob();
      } else {
        imageBlob = imageSource;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 15000);

      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'Content-Type': imageBlob.type || 'application/octet-stream',
        },
        body: imageBlob,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Inference API returned HTTP ${apiResponse.status}: ${errorText}`);
      }

      const data = await apiResponse.json();
      // HF returns array of { label: string, score: number }
      if (Array.isArray(data) && data.length > 0) {
        const rawPredictions: RawModelPrediction[] = data.map((item: { label: string; score: number }) => ({
          label: item.label,
          score: item.score,
        }));

        // Sort descending by score
        rawPredictions.sort((a, b) => b.score - a.score);
        const topRaw = rawPredictions[0];
        const mappedTop = mapModelPrediction(topRaw);

        const allMapped = rawPredictions.slice(0, 5).map((p) => {
          const m = mapModelPrediction(p);
          return {
            category: m.category,
            rawLabel: p.label,
            confidence: m.confidence,
          };
        });

        return {
          predictedCategory: mappedTop.category,
          rawLabel: topRaw.label,
          confidence: mappedTop.confidence,
          allPredictions: allMapped,
          isSimulation: false,
          modelIdentifier: config.modelId,
          predictedAt: new Date().toISOString(),
          disclaimer: generateAiDisclaimer(false, config.modelId),
        };
      } else {
        throw new Error('Unexpected response format from model inference endpoint.');
      }
    } catch (err: unknown) {
      console.warn('Real inference failed, falling back to simulation notice:', err);
      throw err;
    }
  }

  private async callCustomEndpoint(
    imageSource: File | string,
    config: InferenceConfig
  ): Promise<ClassifiedResult> {
    const formData = new FormData();
    if (typeof imageSource === 'string') {
      const res = await fetch(imageSource);
      const blob = await res.blob();
      formData.append('file', blob, 'waste_photo.jpg');
    } else {
      formData.append('file', imageSource);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs || 15000);

    const res = await fetch(config.apiEndpoint!, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Custom endpoint error: HTTP ${res.status}`);
    }

    const json = await res.json();
    const top = json.predictions ? json.predictions[0] : json[0];
    const mapped = mapModelPrediction({ label: top.label || 'unknown', score: top.score || 0.8 });

    return {
      predictedCategory: mapped.category,
      rawLabel: top.label || 'custom_model_output',
      confidence: mapped.confidence,
      allPredictions: [{ category: mapped.category, rawLabel: top.label, confidence: mapped.confidence }],
      isSimulation: false,
      modelIdentifier: config.modelId || 'custom-cv-endpoint',
      predictedAt: new Date().toISOString(),
      disclaimer: generateAiDisclaimer(false, config.modelId || 'custom-cv-endpoint'),
    };
  }

  /**
   * Honest Demo Simulation
   * Prominently labels output as DEMO SIMULATION.
   * Simulates realistic inference latency and probabilistic confidence.
   */
  private async runSimulation(
    imageSource: File | string,
    config: InferenceConfig
  ): Promise<ClassifiedResult> {
    // Artificial 600ms latency to simulate network inference
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filename = '';
    if (typeof imageSource !== 'string' && (imageSource as File).name) {
      filename = (imageSource as File).name.toLowerCase();
    }

    let topLabel = 'cardboard';
    let topScore = 0.92;
    let secondaryLabel = 'paper';
    let secondaryScore = 0.06;

    if (filename.includes('plastic') || filename.includes('bottle') || filename.includes('pet')) {
      topLabel = 'plastic';
      topScore = 0.94;
      secondaryLabel = 'glass';
      secondaryScore = 0.04;
    } else if (filename.includes('glass') || filename.includes('jar')) {
      topLabel = 'glass';
      topScore = 0.91;
      secondaryLabel = 'plastic';
      secondaryScore = 0.07;
    } else if (filename.includes('metal') || filename.includes('can') || filename.includes('tin')) {
      topLabel = 'metal';
      topScore = 0.95;
      secondaryLabel = 'trash';
      secondaryScore = 0.03;
    } else if (filename.includes('paper') || filename.includes('news') || filename.includes('book')) {
      topLabel = 'paper';
      topScore = 0.88;
      secondaryLabel = 'cardboard';
      secondaryScore = 0.09;
    }

    const mapped = mapModelPrediction({ label: topLabel, score: topScore });
    const mappedSec = mapModelPrediction({ label: secondaryLabel, score: secondaryScore });

    return {
      predictedCategory: mapped.category,
      rawLabel: topLabel,
      confidence: mapped.confidence,
      allPredictions: [
        { category: mapped.category, rawLabel: topLabel, confidence: mapped.confidence },
        { category: mappedSec.category, rawLabel: secondaryLabel, confidence: mappedSec.confidence },
        { category: 'Other / Uncertain', rawLabel: 'trash', confidence: 0.02 },
      ],
      isSimulation: true,
      modelIdentifier: config.modelId || 'yangy50/garbage-classification-vit',
      predictedAt: new Date().toISOString(),
      disclaimer: generateAiDisclaimer(true, config.modelId || 'yangy50/garbage-classification-vit'),
    };
  }
}

export const imageClassificationService = new ImageClassificationService();
