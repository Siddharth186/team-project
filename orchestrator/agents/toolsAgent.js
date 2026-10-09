/**
 * NEXUS AI — AGENT 4: DETERMINISTIC TOOLS AGENT
 * Responsibilities:
 *  - Deterministic arithmetic calculations (sum, average, percentage change, totals)
 *  - Structured table filtering, sorting, and counting
 *  - Safe execution without arbitrary code/shell vulnerabilities
 */

export class ToolsAgent {
  /**
   * Extract numbers and currency values from text
   */
  extractNumbers(text) {
    if (!text || typeof text !== 'string') return [];
    // Match numbers like 50, 50,000, 40%, 1.5, ₹4,500,000, etc.
    const regex = /(?:₹|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        matches.push(num);
      }
    }
    return matches;
  }

  /**
   * Calculate Sum
   */
  calculateSum(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0);
  }

  /**
   * Calculate Average
   */
  calculateAverage(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    return this.calculateSum(numbers) / numbers.length;
  }

  /**
   * Calculate Percentage Change
   */
  calculatePercentageChange(oldVal, newVal) {
    if (oldVal === 0) return newVal === 0 ? 0 : 100;
    return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
  }

  /**
   * Run deterministic tool calculation over retrieved evidence
   */
  execute(query, evidence = []) {
    const qLower = (query || '').toLowerCase();
    const allNumbers = [];
    const evidenceSources = [];

    for (const item of evidence) {
      const nums = this.extractNumbers(item.content);
      if (nums.length > 0) {
        for (const n of nums) {
          if (allNumbers.length < 50) allNumbers.push(n);
        }
        evidenceSources.push({
          source: item.fileName || item.fileId || 'document',
          page: item.pageNumber || 1,
          values: nums.slice(0, 10)
        });
      }
    }

    if (allNumbers.length === 0) {
      return {
        toolExecuted: 'none',
        success: false,
        message: 'No numerical data points extracted from retrieved evidence.'
      };
    }

    let calculationType = 'SUM';
    let result = 0;
    let explanation = '';

    const sampleVals = allNumbers.slice(0, 5).join(' + ') + (allNumbers.length > 5 ? ` + ... (${allNumbers.length} total values)` : '');

    if (qLower.includes('average') || qLower.includes('mean')) {
      calculationType = 'AVERAGE';
      result = this.calculateAverage(allNumbers);
      explanation = `Computed exact average across ${allNumbers.length} identified values = **${result.toFixed(2)}**`;
    } else if (qLower.includes('percentage change') || qLower.includes('growth')) {
      calculationType = 'PERCENTAGE_CHANGE';
      if (allNumbers.length >= 2) {
        result = this.calculatePercentageChange(allNumbers[0], allNumbers[1]);
        explanation = `Computed percentage change from ${allNumbers[0]} to ${allNumbers[1]} = **${result.toFixed(2)}%**`;
      }
    } else {
      calculationType = 'SUM';
      result = this.calculateSum(allNumbers);
      explanation = `Calculated total sum across identified values (${sampleVals}) = **${result.toLocaleString()}**`;
    }

    return {
      toolExecuted: calculationType,
      success: true,
      result,
      explanation,
      valuesUsed: allNumbers,
      sources: evidenceSources
    };
  }
}
