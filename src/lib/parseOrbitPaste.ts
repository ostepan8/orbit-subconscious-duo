/**
 * Parses raw Orbit platform paste text into structured data.
 *
 * Orbit paste format:
 *   Startup idea name is: <title>
 *   1 - Market Segmentation: <first line of headline>
 *   <continuation lines for step 1 headline...>
 *   2 - Beachhead Market: <headline for step 2>
 *   <detailed content for the NEXT step>
 *   ...table rows, paragraphs, etc...
 *
 * Context lines can span multiple lines. Everything between one
 * "N - Title:" marker and the next is that step's context.
 * The last marker's headline is only the text on its first line —
 * everything after is detailed content for the next step.
 */

export interface ParsedContextStep {
  stepNumber: number;
  headline: string;
}

export interface ParsedOrbitPaste {
  title: string;
  contextSteps: ParsedContextStep[];
  detailedStepNumber: number | null;
}

// Matches the start of a step context line: "1 - Market Segmentation: ..."
const STEP_MARKER_RE = /^(\d{1,2})\s*-\s*[^:]+:\s*(.*)/;

export function parseOrbitPaste(text: string): ParsedOrbitPaste {
  const lines = text.split("\n");

  // Extract title
  let title = "Orbit Report";
  const titleMatch = text.match(/Startup idea name is:\s*(.+)/i);
  if (titleMatch) title = titleMatch[1].trim();

  // Find all step markers with their line positions
  interface Marker {
    stepNumber: number;
    firstLineContent: string;
    lineIndex: number;
  }

  const markers: Marker[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const match = trimmed.match(STEP_MARKER_RE);
    if (match) {
      const stepNumber = parseInt(match[1], 10);
      if (stepNumber >= 1 && stepNumber <= 24) {
        markers.push({
          stepNumber,
          firstLineContent: match[2].trim(),
          lineIndex: i,
        });
      }
    }
  }

  // Build context steps:
  // - For all markers EXCEPT the last: headline = all lines from this marker to the next
  // - For the LAST marker: headline = only the first line content
  //   (everything after is detailed content for the next step)
  const contextSteps: ParsedContextStep[] = [];

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const isLast = i === markers.length - 1;

    let headline: string;

    if (isLast) {
      // Last context step — only take the text on the marker line
      headline = marker.firstLineContent;
    } else {
      // Not last — collect all lines between this marker and the next
      const nextMarkerLine = markers[i + 1].lineIndex;
      const contentParts: string[] = [];

      if (marker.firstLineContent) {
        contentParts.push(marker.firstLineContent);
      }
      for (let j = marker.lineIndex + 1; j < nextMarkerLine; j++) {
        const trimmed = lines[j].trim();
        if (trimmed) contentParts.push(trimmed);
      }

      headline = contentParts.join(" ").trim();
    }

    if (headline.length > 0) {
      contextSteps.push({ stepNumber: marker.stepNumber, headline });
    }
  }

  // Sort by step number
  contextSteps.sort((a, b) => a.stepNumber - b.stepNumber);

  // The detailed content step is AFTER the last context step
  const detailedStepNumber =
    contextSteps.length > 0
      ? Math.max(...contextSteps.map((s) => s.stepNumber)) + 1
      : null;

  return {
    title,
    contextSteps,
    detailedStepNumber:
      detailedStepNumber && detailedStepNumber <= 24
        ? detailedStepNumber
        : null,
  };
}
