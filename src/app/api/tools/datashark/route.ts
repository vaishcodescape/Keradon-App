import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Groq from 'groq-sdk';
import { getServerSession } from '@/lib/auth/firebase-server';
import { ProjectService } from '@/lib/services/project-service';

// Initialize Groq client for AI-enhanced scraping
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI-Enhanced Content Analysis Function
async function generateAIInsights(extractedData: any, allText: string): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  try {
    // Prepare content summary for AI analysis
    const contentSummary = {
      title: extractedData.page.title,
      domain: extractedData.page.domain,
      contentType: extractedData.insights.contentType,
      businessType: extractedData.insights.businessType,
      wordCount: allText.split(' ').length,
      hasContactInfo: extractedData.contact.hasContactInfo,
      hasPricing: extractedData.business.commercialIndicators.hasPricing,
      technicalComplexity: extractedData.insights.technicalComplexity,
      seoScore: extractedData.seoHealth?.overallScore || 0,
      headings: {
        h1: extractedData.seo.headings.h1.slice(0, 3),
        h2: extractedData.seo.headings.h2.slice(0, 5)
      },
      keyPatterns: {
        hasFinancialData: extractedData.insights.patterns.hasFinancialData,
        hasSocialElements: extractedData.insights.patterns.hasSocialElements,
        hasLocationData: extractedData.insights.patterns.hasLocationData
      }
    };

    const systemPrompt = `You are DataShark AI, an expert web content analyzer and business intelligence specialist. Analyze the provided website data and generate intelligent insights.

Your response must be a valid JSON object with this exact structure:
{
  "businessInsights": {
    "industry": "string",
    "businessModel": "string", 
    "targetAudience": "string",
    "competitiveAdvantages": ["advantage1", "advantage2"],
    "marketPosition": "string"
  },
  "contentAnalysis": {
    "contentQuality": "high|medium|low",
    "mainTopics": ["topic1", "topic2", "topic3"],
    "contentGaps": ["gap1", "gap2"],
    "improvementSuggestions": ["suggestion1", "suggestion2"]
  },
  "technicalInsights": {
    "performanceIndicators": ["indicator1", "indicator2"],
    "securityAssessment": "secure|moderate|concerning",
    "mobileReadiness": "excellent|good|poor",
    "recommendations": ["rec1", "rec2"]
  },
  "dataExtractionSummary": {
    "dataRichness": "high|medium|low",
    "structuredDataQuality": "excellent|good|poor",
    "extractionDifficulty": "easy|moderate|complex",
    "bestDataSources": ["source1", "source2"]
  },
  "actionableInsights": {
    "businessOpportunities": ["opportunity1", "opportunity2"],
    "dataUtilization": ["use1", "use2"],
    "monitoringRecommendations": ["monitor1", "monitor2"]
  }
}

Focus on providing practical, actionable insights that would help with business intelligence, competitive analysis, and data utilization.`;

    const userPrompt = `Analyze this website data:

Website: ${contentSummary.title} (${contentSummary.domain})
Content Type: ${contentSummary.contentType}
Business Type: ${contentSummary.businessType}
Word Count: ${contentSummary.wordCount}
SEO Score: ${contentSummary.seoScore}/100
Technical Complexity: ${contentSummary.technicalComplexity}

Key Information:
- Has Contact Info: ${contentSummary.hasContactInfo}
- Has Pricing: ${contentSummary.hasPricing}
- Has Financial Data: ${contentSummary.keyPatterns.hasFinancialData}
- Has Social Elements: ${contentSummary.keyPatterns.hasSocialElements}
- Has Location Data: ${contentSummary.keyPatterns.hasLocationData}

Main Headings:
H1: ${contentSummary.headings.h1.join(', ')}
H2: ${contentSummary.headings.h2.join(', ')}

Generate comprehensive AI insights for this website data.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) return null;

    // Parse the JSON response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);

  } catch (error) {
    console.error('AI insights generation error:', error);
    return null;
  }
}

// Enhanced Data Extraction with AI
async function enhanceDataWithAI(extractedData: any, allText: string): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    return extractedData;
  }

  try {
    // Generate AI insights
    const aiInsights = await generateAIInsights(extractedData, allText);
    
    // Enhance the extracted data with AI insights
    if (aiInsights) {
      extractedData.aiInsights = {
        ...aiInsights,
        generatedAt: new Date().toISOString(),
        model: 'llama-3.3-70b-versatile',
        confidence: 'high'
      };

      // Update summary with AI-enhanced metrics
      extractedData.summary = {
        ...extractedData.summary,
        aiEnhanced: true,
        businessIntelligence: aiInsights.businessInsights?.industry || 'Unknown',
        contentQualityAI: aiInsights.contentAnalysis?.contentQuality || 'unknown',
        dataUtilizationScore: aiInsights.dataExtractionSummary?.dataRichness === 'high' ? 90 : 
                             aiInsights.dataExtractionSummary?.dataRichness === 'medium' ? 70 : 50
      };
    }

    return extractedData;
  } catch (error) {
    console.error('AI enhancement error:', error);
    return extractedData;
  }
}

interface ScrapeRequest {
  url: string;
  format: 'text' | 'json' | 'csv' | 'xml';
  selectors?: {
    title?: string;
    content?: string;
    links?: string;
    images?: string;
    custom?: Record<string, string>;
  };
}

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    url: string;
    timestamp: string;
    format: string;
    elementsFound: number;
    scraperUsed: string;
  };
}

// Helper functions for data analysis and scoring
function calculateReadabilityScore(text: string): number {
  if (!text || text.length === 0) return 0;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => {
    return count + Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length);
  }, 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  // Simplified Flesch Reading Ease score
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// 🕸️ SEO Health Score Calculator
function calculateSEOHealthScore($: cheerio.CheerioAPI, meta: any, headings: any, allText: string, images: any[]): any {
  try {
    let totalScore = 0;
    const maxScore = 100;
    const seoFactors: any = {
      titleTag: { score: 0, maxScore: 15, issues: [] },
      metaDescription: { score: 0, maxScore: 15, issues: [] },
      headingStructure: { score: 0, maxScore: 15, issues: [] },
      imageOptimization: { score: 0, maxScore: 10, issues: [] },
      internalLinking: { score: 0, maxScore: 10, issues: [] },
      pageSpeed: { score: 0, maxScore: 10, issues: [] },
      mobileOptimization: { score: 0, maxScore: 10, issues: [] },
      schemaMarkup: { score: 0, maxScore: 5, issues: [] },
      socialTags: { score: 0, maxScore: 5, issues: [] },
      technicalSEO: { score: 0, maxScore: 5, issues: [] }
    };

    // Title Tag Analysis (15 points)
    const title = $('title').text();
    if (title) {
      if (title.length >= 30 && title.length <= 60) {
        seoFactors.titleTag.score = 15;
      } else if (title.length > 0) {
        seoFactors.titleTag.score = 10;
        if (title.length < 30) seoFactors.titleTag.issues.push('Title too short (< 30 chars)');
        if (title.length > 60) seoFactors.titleTag.issues.push('Title too long (> 60 chars)');
      }
    } else {
      seoFactors.titleTag.issues.push('Missing title tag');
    }

    // Meta Description Analysis (15 points)
    if (meta.description) {
      if (meta.description.length >= 120 && meta.description.length <= 160) {
        seoFactors.metaDescription.score = 15;
      } else if (meta.description.length > 0) {
        seoFactors.metaDescription.score = 10;
        if (meta.description.length < 120) seoFactors.metaDescription.issues.push('Meta description too short (< 120 chars)');
        if (meta.description.length > 160) seoFactors.metaDescription.issues.push('Meta description too long (> 160 chars)');
      }
    } else {
      seoFactors.metaDescription.issues.push('Missing meta description');
    }

    // Heading Structure Analysis (15 points)
    const h1Count = headings.h1?.length || 0;
    const h2Count = headings.h2?.length || 0;
    const h3Count = headings.h3?.length || 0;
    
    if (h1Count === 1) {
      seoFactors.headingStructure.score += 8;
    } else if (h1Count === 0) {
      seoFactors.headingStructure.issues.push('Missing H1 tag');
    } else {
      seoFactors.headingStructure.issues.push('Multiple H1 tags found');
      seoFactors.headingStructure.score += 4;
    }
    
    if (h2Count > 0) seoFactors.headingStructure.score += 4;
    if (h3Count > 0) seoFactors.headingStructure.score += 3;

    // Image Optimization Analysis (10 points)
    const totalImages = images.length;
    const imagesWithAlt = images.filter(img => img.alt && img.alt.length > 0).length;
    
    if (totalImages > 0) {
      const altTextRatio = imagesWithAlt / totalImages;
      seoFactors.imageOptimization.score = Math.round(altTextRatio * 10);
      if (altTextRatio < 1) {
        seoFactors.imageOptimization.issues.push(`${totalImages - imagesWithAlt} images missing alt text`);
      }
    } else {
      seoFactors.imageOptimization.score = 5; // No images is neutral
    }

    // Internal Linking Analysis (10 points)
    const internalLinks = $('a[href^="/"], a[href^="#"]').length;
    if (internalLinks >= 5) {
      seoFactors.internalLinking.score = 10;
    } else if (internalLinks > 0) {
      seoFactors.internalLinking.score = 6;
      seoFactors.internalLinking.issues.push('Could benefit from more internal links');
    } else {
      seoFactors.internalLinking.issues.push('No internal links found');
    }

    // Page Speed Indicators (10 points)
    const externalScripts = $('script[src^="http"]').length;
    const inlineStyles = $('style').length;
    const totalStylesheets = $('link[rel="stylesheet"]').length;
    
    let speedScore = 10;
    if (externalScripts > 10) {
      speedScore -= 3;
      seoFactors.pageSpeed.issues.push('Too many external scripts');
    }
    if (totalStylesheets > 5) {
      speedScore -= 2;
      seoFactors.pageSpeed.issues.push('Too many stylesheets');
    }
    if (inlineStyles > 3) {
      speedScore -= 2;
      seoFactors.pageSpeed.issues.push('Too many inline styles');
    }
    seoFactors.pageSpeed.score = Math.max(0, speedScore);

    // Mobile Optimization (10 points)
    const viewport = meta.viewport;
    const responsiveImages = images.filter(img => 
      img.class?.includes('responsive') || 
      img.src?.includes('responsive') ||
      img.loading === 'lazy'
    ).length;
    
    if (viewport && viewport.includes('width=device-width')) {
      seoFactors.mobileOptimization.score += 6;
    } else {
      seoFactors.mobileOptimization.issues.push('Missing responsive viewport meta tag');
    }
    
    if (responsiveImages > 0) {
      seoFactors.mobileOptimization.score += 4;
    }

    // Schema Markup (5 points)
    const schemaScripts = $('script[type="application/ld+json"]').length;
    if (schemaScripts > 0) {
      seoFactors.schemaMarkup.score = 5;
    } else {
      seoFactors.schemaMarkup.issues.push('No structured data found');
    }

    // Social Media Tags (5 points)
    const ogTags = $('meta[property^="og:"]').length;
    const twitterTags = $('meta[name^="twitter:"]').length;
    
    if (ogTags >= 3 && twitterTags >= 2) {
      seoFactors.socialTags.score = 5;
    } else if (ogTags > 0 || twitterTags > 0) {
      seoFactors.socialTags.score = 3;
      seoFactors.socialTags.issues.push('Incomplete social media tags');
    } else {
      seoFactors.socialTags.issues.push('Missing social media tags');
    }

    // Technical SEO (5 points)
    const canonicalUrl = $('link[rel="canonical"]').attr('href');
    const robotsMeta = $('meta[name="robots"]').attr('content');
    
    if (canonicalUrl) seoFactors.technicalSEO.score += 3;
    else seoFactors.technicalSEO.issues.push('Missing canonical URL');
    
    if (robotsMeta) seoFactors.technicalSEO.score += 2;
    else seoFactors.technicalSEO.issues.push('Missing robots meta tag');

    // Calculate total score
    totalScore = Object.values(seoFactors).reduce((sum: number, factor: any) => sum + factor.score, 0);
    
    // Generate recommendations
    const recommendations: string[] = [];
    Object.entries(seoFactors).forEach(([key, factor]: [string, any]) => {
      if (factor.issues.length > 0) {
        recommendations.push(...factor.issues);
      }
    });

    // Determine SEO health level
    let healthLevel = 'Poor';
    let healthColor = '🔴';
    if (totalScore >= 80) {
      healthLevel = 'Excellent';
      healthColor = '🟢';
    } else if (totalScore >= 60) {
      healthLevel = 'Good';
      healthColor = '🟡';
    } else if (totalScore >= 40) {
      healthLevel = 'Fair';
      healthColor = '🟠';
    }

    return {
      overallScore: totalScore,
      maxPossibleScore: maxScore,
      healthLevel,
      healthColor,
      breakdown: seoFactors,
      recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calculating SEO health score:', error);
    return {
      overallScore: 0,
      maxPossibleScore: 100,
      healthLevel: 'Unknown',
      healthColor: '⚪',
      breakdown: {},
      recommendations: ['Error analyzing SEO factors'],
      lastAnalyzed: new Date().toISOString()
    };
  }
}

// 📉 Price Alert Tracker
function extractPriceAlertData($: cheerio.CheerioAPI, allText: string): any {
  try {
    const priceData: any = {
      currentPrices: [],
      priceRanges: [],
      discounts: [],
      offers: [],
      saleIndicators: [],
      priceComparisons: [],
      currencies: [],
      priceHistory: [],
      alertTriggers: []
    };

    // Enhanced price detection patterns
    const pricePatterns = [
      // Standard currency formats
      /\$(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/g,
      /(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP|CAD|AUD)/gi,
      /(?:Price|Cost|Fee|Rate)[\s:]+\$?(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/gi,
      // Range prices
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*[-–—]\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      // Starting from prices
      /(?:starting\s+(?:at|from)|from)\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    ];

    // Discount and offer patterns
    const discountPatterns = [
      /(\d+)%\s*(?:off|discount|savings?)/gi,
      /save\s+(?:\$)?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /(?:was|originally)\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s+now\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /(?:regular|orig\.?)\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
    ];

    // Sale and offer indicators
    const saleIndicators = [
      /\b(?:sale|clearance|special|limited\s+time|flash\s+sale|daily\s+deal)\b/gi,
      /\b(?:free\s+shipping|buy\s+one\s+get\s+one|bogo|2\s*for\s*1)\b/gi,
      /\b(?:coupon|promo\s+code|discount\s+code|voucher)\b/gi,
      /\b(?:expires?|ends?|until|valid\s+through)\s+(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+\w+\s+\d{4})/gi
    ];

    // Extract current prices
    pricePatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanPrice = match.replace(/[^\d.,]/g, '');
          const numericValue = parseFloat(cleanPrice.replace(/,/g, ''));
          if (!isNaN(numericValue) && numericValue > 0) {
            priceData.currentPrices.push({
              original: match.trim(),
              value: numericValue,
              currency: match.includes('$') ? 'USD' : 'Unknown',
              context: extractPriceContext($, match)
            });
          }
        });
      }
    });

    // Extract discounts
    discountPatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          priceData.discounts.push({
            text: match.trim(),
            type: match.includes('%') ? 'percentage' : 'amount',
            context: extractPriceContext($, match)
          });
        });
      }
    });

    // Extract sale indicators
    saleIndicators.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          priceData.saleIndicators.push({
            text: match.trim(),
            type: categorizeOffer(match),
            urgency: calculateUrgency(match)
          });
        });
      }
    });

    // Look for price comparison elements
    $('.price-comparison, .compare-price, .was-now, .original-price, .sale-price').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        priceData.priceComparisons.push({
          element: $(el).prop('tagName')?.toLowerCase(),
          class: $(el).attr('class'),
          text: text,
          context: 'price_comparison_section'
        });
      }
    });

    // Detect price drops and offers
    const priceDropIndicators = detectPriceDrops(priceData.currentPrices, priceData.discounts);
    priceData.alertTriggers = priceDropIndicators;

    // Remove duplicates and sort
    priceData.currentPrices = removeDuplicatePrices(priceData.currentPrices);
    priceData.discounts = [...new Set(priceData.discounts.map((d: any) => JSON.stringify(d)))].map((d: unknown) => JSON.parse(d as string));
    priceData.saleIndicators = [...new Set(priceData.saleIndicators.map((s: any) => JSON.stringify(s)))].map((s: unknown) => JSON.parse(s as string));

    // Calculate summary statistics
    const summary = {
      totalPricesFound: priceData.currentPrices.length,
      totalDiscountsFound: priceData.discounts.length,
      totalOffersFound: priceData.saleIndicators.length,
      hasPriceDrops: priceData.alertTriggers.length > 0,
      averagePrice: priceData.currentPrices.length > 0 ? 
        priceData.currentPrices.reduce((sum: number, p: any) => sum + p.value, 0) / priceData.currentPrices.length : 0,
      priceRange: priceData.currentPrices.length > 0 ? {
        min: Math.min(...priceData.currentPrices.map((p: any) => p.value)),
        max: Math.max(...priceData.currentPrices.map((p: any) => p.value))
      } : null,
      urgentOffers: priceData.saleIndicators.filter((s: any) => s.urgency === 'high').length
    };

    return {
      ...priceData,
      summary,
      lastScanned: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting price alert data:', error);
    return {
      currentPrices: [],
      discounts: [],
      offers: [],
      saleIndicators: [],
      alertTriggers: [],
      summary: {
        totalPricesFound: 0,
        totalDiscountsFound: 0,
        totalOffersFound: 0,
        hasPriceDrops: false
      },
      lastScanned: new Date().toISOString()
    };
  }
}

// Helper functions for price analysis
function extractPriceContext($: cheerio.CheerioAPI, priceText: string): string {
  try {
    // Find elements containing the price text
    const elements = $('*').filter((_, el) => {
      return $(el).text().includes(priceText);
    });
    
    if (elements.length > 0) {
      const element = elements.first();
      const classes = element.attr('class') || '';
      const parent = element.parent();
      const parentClasses = parent.attr('class') || '';
      
      // Determine context based on class names and structure
      if (classes.includes('sale') || parentClasses.includes('sale')) return 'sale_price';
      if (classes.includes('original') || parentClasses.includes('original')) return 'original_price';
      if (classes.includes('discount') || parentClasses.includes('discount')) return 'discount_price';
      if (classes.includes('shipping') || parentClasses.includes('shipping')) return 'shipping_cost';
      if (classes.includes('product') || parentClasses.includes('product')) return 'product_price';
    }
    
    return 'general';
  } catch (error) {
    return 'unknown';
  }
}

function categorizeOffer(offerText: string): string {
  const text = offerText.toLowerCase();
  if (text.includes('free shipping')) return 'free_shipping';
  if (text.includes('bogo') || text.includes('buy one get one')) return 'bogo';
  if (text.includes('clearance')) return 'clearance';
  if (text.includes('flash sale') || text.includes('limited time')) return 'limited_time';
  if (text.includes('coupon') || text.includes('promo code')) return 'coupon';
  return 'general_offer';
}

function calculateUrgency(offerText: string): 'low' | 'medium' | 'high' {
  const text = offerText.toLowerCase();
  const highUrgencyWords = ['flash', 'limited time', 'expires today', 'ends soon', 'while supplies last'];
  const mediumUrgencyWords = ['sale', 'special', 'discount', 'expires'];
  
  if (highUrgencyWords.some(word => text.includes(word))) return 'high';
  if (mediumUrgencyWords.some(word => text.includes(word))) return 'medium';
  return 'low';
}

function detectPriceDrops(prices: any[], discounts: any[]): any[] {
  const alerts: any[] = [];
  
  // Look for was/now price patterns
  prices.forEach(price => {
    if (price.context === 'sale_price' && discounts.length > 0) {
      alerts.push({
        type: 'price_drop',
        current_price: price.value,
        context: price.context,
        discount_info: discounts[0], // Associate with first discount found
        alert_level: 'medium'
      });
    }
  });
  
  // Look for high percentage discounts
  discounts.forEach(discount => {
    if (discount.type === 'percentage' && discount.text.match(/(\d+)%/)) {
      const percentage = parseInt(discount.text.match(/(\d+)%/)[1]);
      if (percentage >= 50) {
        alerts.push({
          type: 'high_discount',
          discount_percentage: percentage,
          discount_text: discount.text,
          alert_level: 'high'
        });
      } else if (percentage >= 25) {
        alerts.push({
          type: 'moderate_discount',
          discount_percentage: percentage,
          discount_text: discount.text,
          alert_level: 'medium'
        });
      }
    }
  });
  
  return alerts;
}

function removeDuplicatePrices(prices: any[]): any[] {
  const seen = new Set();
  return prices.filter(price => {
    const key = `${price.value}-${price.currency}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 🧩 Content Blueprint Analyzer
function analyzeContentBlueprint($: cheerio.CheerioAPI, allText: string, headings: any, paragraphs: string[]): any {
  try {
    const blueprint: any = {
      contentTypes: {},
      contentVolume: {},
      contentQuality: {},
      contentStructure: {},
      contentStrategy: {},
      topicClusters: [],
      readabilityAnalysis: {},
      engagementElements: {},
      contentGaps: []
    };

    // Analyze content types and volume
    blueprint.contentTypes = analyzeContentTypes($, allText);
    blueprint.contentVolume = analyzeContentVolume($, paragraphs, allText);
    blueprint.contentQuality = analyzeContentQuality($, paragraphs, headings);
    blueprint.contentStructure = analyzeContentStructure($, headings);
    blueprint.readabilityAnalysis = analyzeReadability(allText, paragraphs);
    blueprint.engagementElements = analyzeEngagementElements($);
    blueprint.topicClusters = extractTopicClusters(allText, headings);
    blueprint.contentStrategy = determineContentStrategy(blueprint);
    blueprint.contentGaps = identifyContentGaps(blueprint);

    return blueprint;
  } catch (error) {
    console.error('Error analyzing content blueprint:', error);
    return {
      contentTypes: {},
      contentVolume: {},
      contentQuality: {},
      contentStructure: {},
      contentStrategy: {},
      topicClusters: [],
      readabilityAnalysis: {},
      engagementElements: {},
      contentGaps: []
    };
  }
}

function analyzeContentTypes($: cheerio.CheerioAPI, allText: string): any {
  const types = {
    textual: {
      paragraphs: $('p').length,
      headings: $('h1, h2, h3, h4, h5, h6').length,
      lists: $('ul, ol').length,
      blockquotes: $('blockquote').length,
      articles: $('article').length
    },
    media: {
      images: $('img').length,
      videos: $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length,
      audio: $('audio').length,
      galleries: $('.gallery, .image-gallery, .photo-gallery').length
    },
    interactive: {
      forms: $('form').length,
      buttons: $('button, input[type="button"], input[type="submit"]').length,
      links: $('a').length,
      tabs: $('.tab, .tabs, [role="tab"]').length,
      accordions: $('.accordion, .collapse').length
    },
    structural: {
      navigation: $('nav').length,
      sidebars: $('.sidebar, .aside, aside').length,
      footers: $('footer').length,
      headers: $('header').length
    },
    specialized: {
      testimonials: $('.testimonial, .review, .feedback').length,
      faqs: $('.faq, .frequently-asked').length,
      pricing: $('.pricing, .price-table, .plan').length,
      team: $('.team, .staff, .employee').length,
      portfolio: $('.portfolio, .gallery, .work').length
    }
  };

  // Calculate content type distribution
  const totalElements = Object.values(types).reduce((sum, category: any) => {
    return sum + Object.values(category).reduce((catSum: number, count: any) => catSum + count, 0);
  }, 0);

  const distribution = {};
  Object.entries(types).forEach(([category, items]: [string, any]) => {
    const categoryTotal = Object.values(items).reduce((sum: number, count: any) => sum + count, 0);
    (distribution as any)[category] = {
      count: categoryTotal,
      percentage: totalElements > 0 ? Math.round((categoryTotal / totalElements) * 100) : 0,
      breakdown: items
    };
  });

  return {
    types,
    distribution,
    totalElements,
    primaryType: determinePrimaryContentType(distribution)
  };
}

function analyzeContentVolume($: cheerio.CheerioAPI, paragraphs: string[], allText: string): any {
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  return {
    totalWords: words.length,
    totalSentences: sentences.length,
    totalParagraphs: paragraphs.length,
    averageWordsPerParagraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
    averageSentencesPerParagraph: paragraphs.length > 0 ? Math.round(sentences.length / paragraphs.length) : 0,
    averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
    contentDensity: calculateContentDensity(words.length, $('*').length),
    readingTime: Math.ceil(words.length / 200), // Assuming 200 words per minute
    volumeRating: categorizeContentVolume(words.length)
  };
}

function analyzeContentQuality($: cheerio.CheerioAPI, paragraphs: string[], headings: any): any {
  let qualityScore = 0;
  const factors = [];

  // Paragraph quality
  const avgParagraphLength = paragraphs.length > 0 ? 
    paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length : 0;
  
  if (avgParagraphLength >= 100 && avgParagraphLength <= 300) {
    qualityScore += 20;
    factors.push('Good paragraph length');
  } else if (avgParagraphLength > 0) {
    qualityScore += 10;
    factors.push(avgParagraphLength < 100 ? 'Short paragraphs' : 'Long paragraphs');
  }

  // Heading hierarchy
  const h1Count = headings.h1?.length || 0;
  const h2Count = headings.h2?.length || 0;
  
  if (h1Count === 1 && h2Count > 0) {
    qualityScore += 20;
    factors.push('Good heading structure');
  } else if (h1Count > 0) {
    qualityScore += 10;
    factors.push('Basic heading structure');
  }

  // Content organization
  const hasLists = $('ul, ol').length > 0;
  const hasBlockquotes = $('blockquote').length > 0;
  
  if (hasLists) {
    qualityScore += 15;
    factors.push('Well-organized with lists');
  }
  
  if (hasBlockquotes) {
    qualityScore += 10;
    factors.push('Includes quotes/highlights');
  }

  // Visual elements
  const imageCount = $('img').length;
  const paragraphCount = paragraphs.length;
  
  if (imageCount > 0 && paragraphCount > 0) {
    const imageToTextRatio = imageCount / paragraphCount;
    if (imageToTextRatio >= 0.1 && imageToTextRatio <= 0.5) {
      qualityScore += 15;
      factors.push('Good text-to-image balance');
    }
  }

  // Interactive elements
  if ($('a').length > 0) {
    qualityScore += 10;
    factors.push('Includes internal/external links');
  }

  return {
    overallScore: Math.min(100, qualityScore),
    factors,
    rating: qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : qualityScore >= 40 ? 'Fair' : 'Poor'
  };
}

function analyzeContentStructure($: cheerio.CheerioAPI, headings: any): any {
  const structure = {
    hierarchy: {
      h1: headings.h1?.length || 0,
      h2: headings.h2?.length || 0,
      h3: headings.h3?.length || 0,
      total: (headings.h1?.length || 0) + (headings.h2?.length || 0) + (headings.h3?.length || 0)
    },
    organization: {
      hasTableOfContents: $('.toc, .table-of-contents, #toc').length > 0,
      hasBreadcrumbs: $('.breadcrumb, .breadcrumbs').length > 0,
      hasNavigation: $('nav').length > 0,
      hasSidebar: $('.sidebar, aside').length > 0
    },
    sections: [] as Array<{level: string, title: string, order: number}>,
    flowScore: 0
  };

  // Analyze content flow
  let flowScore = 0;
  if (structure.hierarchy.h1 === 1) flowScore += 25;
  if (structure.hierarchy.h2 > 0) flowScore += 25;
  if (structure.hierarchy.h3 > 0) flowScore += 15;
  if (structure.organization.hasTableOfContents) flowScore += 20;
  if (structure.organization.hasBreadcrumbs) flowScore += 15;

  structure.flowScore = flowScore;

  // Extract section structure
  $('h1, h2, h3').each((_, el) => {
    const tagName = $(el).prop('tagName')?.toLowerCase();
    const text = $(el).text().trim();
    if (text && tagName) {
      structure.sections.push({
        level: tagName,
        title: text,
        order: structure.sections.length + 1
      });
    }
  });

  return structure;
}

function analyzeReadability(allText: string, paragraphs: string[]): any {
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate various readability metrics
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgSyllablesPerWord = calculateAverageSyllables(words);
  
  // Flesch Reading Ease
  const fleschScore = sentences.length > 0 && words.length > 0 ? 
    206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord) : 0;
  
  // Flesch-Kincaid Grade Level
  const gradeLevel = sentences.length > 0 && words.length > 0 ?
    (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59 : 0;

  return {
    fleschReadingEase: Math.max(0, Math.min(100, Math.round(fleschScore))),
    fleschKincaidGrade: Math.max(0, Math.round(gradeLevel * 10) / 10),
    averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    readingLevel: determineReadingLevel(fleschScore),
    estimatedReadingTime: Math.ceil(words.length / 200),
    complexityRating: gradeLevel <= 8 ? 'Simple' : gradeLevel <= 12 ? 'Moderate' : 'Complex'
  };
}

function analyzeEngagementElements($: cheerio.CheerioAPI): any {
  return {
    callsToAction: $('button, .cta, .call-to-action, a[href*="contact"], a[href*="signup"], a[href*="buy"]').length,
    socialSharing: $('.share, .social-share, [class*="share"]').length,
    comments: $('.comment, .comments, #comments').length,
    forms: $('form').length,
    interactiveElements: $('button, input, select, textarea').length,
    multimedia: $('video, audio, iframe').length,
    downloadableContent: $('a[href*=".pdf"], a[href*=".doc"], a[href*=".zip"]').length,
    externalLinks: $('a[href^="http"]').length,
    internalLinks: $('a[href^="/"], a[href^="#"]').length,
    engagementScore: calculateEngagementScore($)
  };
}

function extractTopicClusters(allText: string, headings: any): any[] {
  const clusters = [];
  
  // Extract main topics from headings
  const allHeadings = [
    ...(headings.h1 || []),
    ...(headings.h2 || []),
    ...(headings.h3 || [])
  ];
  
  // Simple topic extraction based on common words
  const topicWords = extractTopicWords(allText);
  const headingTopics = allHeadings.map(heading => {
    const words = heading.toLowerCase().split(/\s+/);
    return {
      heading,
      topics: words.filter((word: string) => topicWords.includes(word)),
      level: 'heading'
    };
  });
  
  return headingTopics.slice(0, 10); // Return top 10 topic clusters
}

function determineContentStrategy(blueprint: any): any {
  const strategy = {
    primaryFocus: 'Unknown',
    contentMix: {},
    recommendations: [] as string[],
    strategicScore: 0
  };
  
  // Determine primary focus based on content analysis
  const contentTypes = blueprint.contentTypes?.distribution || {};
  let maxPercentage = 0;
  let primaryType = 'textual';
  
  Object.entries(contentTypes).forEach(([type, data]: [string, any]) => {
    if (data.percentage > maxPercentage) {
      maxPercentage = data.percentage;
      primaryType = type;
    }
  });
  
  strategy.primaryFocus = primaryType;
  strategy.contentMix = contentTypes;
  
  // Generate recommendations
  if (blueprint.contentQuality?.overallScore < 60) {
    strategy.recommendations.push('Improve content quality and structure');
  }
  if (blueprint.engagementElements?.engagementScore < 50) {
    strategy.recommendations.push('Add more engagement elements');
  }
  if (blueprint.contentVolume?.totalWords < 300) {
    strategy.recommendations.push('Increase content volume for better SEO');
  }
  
  return strategy;
}

function identifyContentGaps(blueprint: any): string[] {
  const gaps = [];
  
  if (!blueprint.contentTypes?.types?.specialized?.testimonials) {
    gaps.push('Missing customer testimonials');
  }
  if (!blueprint.contentTypes?.types?.specialized?.faqs) {
    gaps.push('Missing FAQ section');
  }
  if (!blueprint.engagementElements?.callsToAction) {
    gaps.push('Missing call-to-action elements');
  }
  if (!blueprint.contentStructure?.organization?.hasTableOfContents && blueprint.contentVolume?.totalWords > 1000) {
    gaps.push('Long content missing table of contents');
  }
  
  return gaps;
}

// Helper functions for content analysis
function calculateContentDensity(wordCount: number, elementCount: number): number {
  return elementCount > 0 ? Math.round((wordCount / elementCount) * 100) / 100 : 0;
}

function categorizeContentVolume(wordCount: number): string {
  if (wordCount < 300) return 'Short';
  if (wordCount < 1000) return 'Medium';
  if (wordCount < 2500) return 'Long';
  return 'Very Long';
}

function calculateAverageSyllables(words: string[]): number {
  if (words.length === 0) return 0;
  
  const totalSyllables = words.reduce((count, word) => {
    return count + Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length);
  }, 0);
  
  return totalSyllables / words.length;
}

function determineReadingLevel(fleschScore: number): string {
  if (fleschScore >= 90) return 'Very Easy';
  if (fleschScore >= 80) return 'Easy';
  if (fleschScore >= 70) return 'Fairly Easy';
  if (fleschScore >= 60) return 'Standard';
  if (fleschScore >= 50) return 'Fairly Difficult';
  if (fleschScore >= 30) return 'Difficult';
  return 'Very Difficult';
}

function calculateEngagementScore($: cheerio.CheerioAPI): number {
  let score = 0;
  
  // CTAs
  const ctas = $('button, .cta, .call-to-action').length;
  score += Math.min(ctas * 10, 30);
  
  // Forms
  const forms = $('form').length;
  score += Math.min(forms * 15, 30);
  
  // Interactive elements
  const interactive = $('input, select, textarea').length;
  score += Math.min(interactive * 5, 20);
  
  // Social elements
  const social = $('.share, .social').length;
  score += Math.min(social * 10, 20);
  
  return Math.min(score, 100);
}

function extractTopicWords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordCount: { [key: string]: number } = {};
  
  words.forEach((word: string) => {
    if (!isStopWord(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

function isStopWord(word: string): boolean {
  const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
  return stopWords.includes(word);
}

function determinePrimaryContentType(distribution: any): string {
  let maxPercentage = 0;
  let primaryType = 'textual';
  
  Object.entries(distribution).forEach(([type, data]: [string, any]) => {
    if (data.percentage > maxPercentage) {
      maxPercentage = data.percentage;
      primaryType = type;
    }
  });
  
  return primaryType;
}

function calculateContactScore(contactInfo: any): number {
  let score = 0;
  if (contactInfo.phones.length > 0) score += 30;
  if (contactInfo.emails.length > 0) score += 40;
  if (contactInfo.addresses.length > 0) score += 30;
  return Math.min(100, score);
}

function determineContentType(title: string, headings: any, paragraphs: string[], links: any): string {
  const allText = (title + ' ' + headings.h1.join(' ') + ' ' + paragraphs.join(' ')).toLowerCase();
  
  if (allText.includes('blog') || allText.includes('article') || allText.includes('post')) return 'Blog/Article';
  if (allText.includes('shop') || allText.includes('buy') || allText.includes('cart') || links.download.length > 0) return 'E-commerce';
  if (allText.includes('about') || allText.includes('company') || allText.includes('business')) return 'Corporate';
  if (allText.includes('portfolio') || allText.includes('gallery') || allText.includes('work')) return 'Portfolio';
  if (allText.includes('news') || allText.includes('press') || allText.includes('media')) return 'News/Media';
  if (allText.includes('contact') || allText.includes('service') || allText.includes('support')) return 'Service';
  if (headings.h1.length === 0 && paragraphs.length === 0) return 'Landing Page';
  
  return 'General Website';
}

function determineBusinessType(contactInfo: any, links: any, patterns: any): string {
  const hasContact = contactInfo.phones.length > 0 || contactInfo.emails.length > 0;
  const hasSocial = links.social.length > 0;
  const hasFinancial = patterns.currencies.length > 0;
  
  if (hasFinancial && hasContact) return 'Commercial Business';
  if (hasSocial && !hasContact) return 'Content/Media';
  if (hasContact && !hasSocial) return 'Professional Services';
  if (links.download.length > 0) return 'Resource/Documentation';
  
  return 'Informational';
}

function calculateTechnicalComplexity(text: string): 'Low' | 'Medium' | 'High' {
  const technicalTerms = ['API', 'SDK', 'JavaScript', 'HTML', 'CSS', 'database', 'server', 'cloud', 'integration', 'framework'];
  const matches = technicalTerms.filter(term => text.toLowerCase().includes(term.toLowerCase())).length;
  
  if (matches >= 5) return 'High';
  if (matches >= 2) return 'Medium';
  return 'Low';
}

function calculateContentRichness(headings: any, paragraphs: string[], links: any, images: any[]): 'Low' | 'Medium' | 'High' {
  const totalElements = headings.h1.length + headings.h2.length + headings.h3.length + 
                       paragraphs.length + links.all.length + images.length;
  
  if (totalElements >= 50) return 'High';
  if (totalElements >= 20) return 'Medium';
  return 'Low';
}

function calculateDataQuality(title: string, meta: any, headings: any, paragraphs: string[]): number {
  let score = 0;
  
  // Title quality (0-20 points)
  if (title && title.length > 10 && title.length < 70) score += 20;
  else if (title && title.length > 0) score += 10;
  
  // Meta description quality (0-20 points)
  if (meta.description && meta.description.length > 50 && meta.description.length < 160) score += 20;
  else if (meta.description && meta.description.length > 0) score += 10;
  
  // Heading structure (0-30 points)
  if (headings.h1.length === 1) score += 15;
  else if (headings.h1.length > 0) score += 10;
  if (headings.h2.length > 0) score += 10;
  if (headings.h3.length > 0) score += 5;
  
  // Content quality (0-30 points)
  if (paragraphs.length >= 3) score += 30;
  else if (paragraphs.length > 0) score += 15;
  
  return Math.min(100, score);
}

function calculateScrapingDifficulty(links: any, images: any[], text: string): 'Easy' | 'Medium' | 'Hard' {
  let complexityScore = 0;
  
  // Many external links suggest dynamic content
  if (links.external.length > 20) complexityScore += 2;
  
  // Many images might indicate heavy media content
  if (images.length > 10) complexityScore += 1;
  
  // Check for dynamic content indicators
  const dynamicIndicators = ['javascript', 'ajax', 'spa', 'react', 'vue', 'angular'];
  if (dynamicIndicators.some(indicator => text.toLowerCase().includes(indicator))) {
    complexityScore += 3;
  }
  
  if (complexityScore >= 4) return 'Hard';
  if (complexityScore >= 2) return 'Medium';
  return 'Easy';
}

// Aggressive data extraction functions

function extractBusinessData($: cheerio.CheerioAPI, allText: string) {
  try {
    const businessData: any = {
      companyName: '',
      industry: '',
      services: [],
      products: [],
      locations: [],
      businessHours: [],
      certifications: [],
      awards: [],
      testimonials: [],
      pricing: [],
      team: []
    };

    // Extract company name from various sources
    businessData.companyName = 
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[name="application-name"]').attr('content') ||
      $('.company-name, .brand-name, .logo-text, .site-title').first().text().trim() ||
      $('h1').first().text().trim();

    // Extract services/products from navigation, headings, and lists
    const serviceSelectors = [
      'nav a', '.services li', '.products li', '.menu-item',
      '.service-item', '.product-item', 'h2, h3, h4'
    ];
    
    serviceSelectors.forEach(selector => {
      $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 3 && text.length < 100) {
          if (text.toLowerCase().includes('service') || 
              text.toLowerCase().includes('solution') ||
              text.toLowerCase().includes('consulting')) {
            businessData.services.push(text);
          } else if (text.toLowerCase().includes('product') ||
                    text.toLowerCase().includes('software') ||
                    text.toLowerCase().includes('app')) {
            businessData.products.push(text);
          }
        }
      });
    });

    // Extract business hours
    const hourPatterns = [
      /(?:open|hours?|operating)\s*:?\s*([^\.]+)/gi,
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?[\s-]+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/g,
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)[\s:,-]+([^,\n]+)/gi
    ];

    hourPatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        businessData.businessHours.push(...matches.slice(0, 10));
      }
    });

    // Extract pricing information
    const pricePatterns = [
      /\$\d{1,6}(?:,\d{3})*(?:\.\d{2})?(?:\s*(?:per|\/)\s*\w+)?/g,
      /(?:price|cost|fee|rate)[\s:]+\$?\d+/gi,
      /(?:starting\s+(?:at|from)|from)\s+\$\d+/gi
    ];

    pricePatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        businessData.pricing.push(...matches.slice(0, 20));
      }
    });

    // Extract team members
    $('.team-member, .staff, .employee, .bio').each((_, el) => {
      const name = $(el).find('.name, h3, h4').first().text().trim();
      const title = $(el).find('.title, .position, .role').first().text().trim();
      if (name) {
        businessData.team.push({ name, title });
      }
    });

    // Remove duplicates
    businessData.services = [...new Set(businessData.services)].slice(0, 20);
    businessData.products = [...new Set(businessData.products)].slice(0, 20);
    businessData.businessHours = [...new Set(businessData.businessHours)].slice(0, 10);
    businessData.pricing = [...new Set(businessData.pricing)].slice(0, 15);

    return businessData;
  } catch (error) {
    console.error('Error extracting business data:', error);
    return {
      companyName: '',
      industry: '',
      services: [],
      products: [],
      locations: [],
      businessHours: [],
      certifications: [],
      awards: [],
      testimonials: [],
      pricing: [],
      team: []
    };
  }
}

function extractTechnicalData($: cheerio.CheerioAPI, html: string) {
  try {
    const techData: any = {
      technologies: [],
      frameworks: [],
      analytics: [],
      cdn: [],
      performance: {},
      security: {},
      seo: {},
      accessibility: {}
    };

    // Extract technologies from script sources and meta tags
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('jquery')) techData.technologies.push('jQuery');
      if (src.includes('react')) techData.technologies.push('React');
      if (src.includes('vue')) techData.technologies.push('Vue.js');
      if (src.includes('angular')) techData.technologies.push('Angular');
      if (src.includes('bootstrap')) techData.frameworks.push('Bootstrap');
      if (src.includes('analytics')) techData.analytics.push('Google Analytics');
      if (src.includes('gtag')) techData.analytics.push('Google Tag Manager');
      if (src.includes('facebook')) techData.analytics.push('Facebook Pixel');
      if (src.includes('cdn')) techData.cdn.push(src);
    });

    // Extract meta tags for SEO analysis
    techData.seo = {
      title: $('title').text().length,
      metaDescription: $('meta[name="description"]').attr('content')?.length || 0,
      metaKeywords: $('meta[name="keywords"]').attr('content') ? true : false,
      ogTags: $('meta[property^="og:"]').length,
      twitterCards: $('meta[name^="twitter:"]').length,
      canonicalUrl: $('link[rel="canonical"]').attr('href') || '',
      robots: $('meta[name="robots"]').attr('content') || '',
      schemaMarkup: $('script[type="application/ld+json"]').length
    };

    // Extract performance indicators
    techData.performance = {
      totalImages: $('img').length,
      imagesWithoutAlt: $('img:not([alt])').length,
      externalScripts: $('script[src^="http"]').length,
      inlineScripts: $('script:not([src])').length,
      stylesheets: $('link[rel="stylesheet"]').length,
      totalLinks: $('a').length,
      internalLinks: $('a[href^="/"], a[href^="#"]').length,
      externalLinks: $('a[href^="http"]').length
    };

    // Extract security features
    techData.security = {
      httpsRedirect: html.includes('https://') ? true : false,
      contentSecurityPolicy: $('meta[http-equiv="Content-Security-Policy"]').length > 0,
      xFrameOptions: html.includes('X-Frame-Options') ? true : false,
      hasContactForm: $('form').length > 0,
      hasFileUpload: $('input[type="file"]').length > 0
    };

    // Remove duplicates
    techData.technologies = [...new Set(techData.technologies)];
    techData.frameworks = [...new Set(techData.frameworks)];
    techData.analytics = [...new Set(techData.analytics)];

    return techData;
  } catch (error) {
    console.error('Error extracting technical data:', error);
    return {
      technologies: [],
      frameworks: [],
      analytics: [],
      cdn: [],
      performance: {},
      security: {},
      seo: {},
      accessibility: {}
    };
  }
}

function extractContentData($: cheerio.CheerioAPI, allText: string) {
  try {
    const contentData: any = {
      forms: [],
      tables: [],
      lists: [],
      multimedia: [],
      downloads: [],
      events: [],
      news: [],
      blog: [],
      testimonials: [],
      faqs: [],
      breadcrumbs: [],
      navigation: []
    };

    // Extract forms with detailed information
    $('form').each((_, el) => {
      const form = {
        action: $(el).attr('action') || '',
        method: $(el).attr('method') || 'GET',
        fields: [] as any[],
        hasFileUpload: $(el).find('input[type="file"]').length > 0,
        hasEmailField: $(el).find('input[type="email"]').length > 0,
        hasPasswordField: $(el).find('input[type="password"]').length > 0
      };

      $(el).find('input, select, textarea').each((_, field) => {
        const fieldData = {
          type: $(field).attr('type') || $(field).prop('tagName')?.toLowerCase() || 'text',
          name: $(field).attr('name') || '',
          placeholder: $(field).attr('placeholder') || '',
          required: $(field).attr('required') ? true : false
        };
        form.fields.push(fieldData);
      });

      contentData.forms.push(form);
    });

    // Extract tables with data
    $('table').each((_, el) => {
      const table = {
        headers: [] as string[],
        rows: $(el).find('tr').length,
        columns: $(el).find('th, td').first().parent()?.find('th, td').length || 0
      };

      $(el).find('th').each((_, th) => {
        table.headers.push($(th).text().trim());
      });

      if (table.rows > 1) {
        contentData.tables.push(table);
      }
    });

    // Extract navigation structure
    $('nav, .navigation, .menu').each((_, nav) => {
      const navItems: string[] = [];
      $(nav).find('a').each((_, link) => {
        const text = $(link).text().trim();
        if (text.length > 0 && text.length < 50) {
          navItems.push(text);
        }
      });
      if (navItems.length > 0) {
        contentData.navigation.push(navItems);
      }
    });

    // Extract multimedia content
    $('video, audio, iframe, embed').each((_, el) => {
      const media = {
        type: $(el).prop('tagName')?.toLowerCase() || 'media',
        src: $(el).attr('src') || $(el).attr('data-src') || '',
        title: $(el).attr('title') || $(el).attr('alt') || ''
      };
      if (media.src) {
        contentData.multimedia.push(media);
      }
    });

    // Extract downloadable content
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.tar', '.gz'];
      
      if (downloadExtensions.some(ext => href.toLowerCase().includes(ext))) {
        contentData.downloads.push({
          text: $(el).text().trim(),
          href: href,
          type: href.split('.').pop()?.toLowerCase() || 'unknown'
        });
      }
    });

    // Extract FAQ content
    $('.faq, .frequently-asked, .question').each((_, el) => {
      const question = $(el).find('.question, h3, h4, dt').first().text().trim();
      const answer = $(el).find('.answer, p, dd').first().text().trim();
      if (question && answer) {
        contentData.faqs.push({ question, answer });
      }
    });

    // Extract testimonials
    $('.testimonial, .review, .feedback').each((_, el) => {
      const text = $(el).find('p, .text, .content').first().text().trim();
      const author = $(el).find('.author, .name, .customer').first().text().trim();
      if (text) {
        contentData.testimonials.push({ text, author });
      }
    });

    // Extract breadcrumbs
    $('.breadcrumb, .breadcrumbs').each((_, el) => {
      const crumbs: string[] = [];
      $(el).find('a, span').each((_, crumb) => {
        const text = $(crumb).text().trim();
        if (text) crumbs.push(text);
      });
      if (crumbs.length > 0) {
        contentData.breadcrumbs = crumbs;
      }
    });

    return contentData;
  } catch (error) {
    console.error('Error extracting content data:', error);
    return {
      forms: [],
      tables: [],
      lists: [],
      multimedia: [],
      downloads: [],
      events: [],
      news: [],
      blog: [],
      testimonials: [],
      faqs: [],
      breadcrumbs: [],
      navigation: []
    };
  }
}

function extractAdvancedPatterns(allText: string) {
  try {
    const patterns: any = {
      coordinates: [],
      ipAddresses: [],
      domains: [],
      creditCards: [],
      ssn: [],
      licenses: [],
      codes: [],
      ids: [],
      versions: [],
      apis: [],
      databases: [],
      protocols: []
    };

    // Geographic coordinates
    const coordRegex = /(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/g;
    patterns.coordinates = [...new Set((allText.match(coordRegex) || []))].slice(0, 10);

    // IP Addresses
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    patterns.ipAddresses = [...new Set((allText.match(ipRegex) || []))].slice(0, 10);

    // Domain names
    const domainRegex = /\b[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}\b/g;
    patterns.domains = [...new Set((allText.match(domainRegex) || []))].slice(0, 20);

    // License/Certificate numbers
    const licenseRegex = /(?:license|cert|certificate|permit)[\s#:]*([A-Z0-9-]+)/gi;
    patterns.licenses = [...new Set((allText.match(licenseRegex) || []))].slice(0, 10);

    // Version numbers
    const versionRegex = /v?\d+\.\d+(?:\.\d+)?(?:\.\d+)?/g;
    patterns.versions = [...new Set((allText.match(versionRegex) || []))].slice(0, 15);

    // API endpoints
    const apiRegex = /\/api\/[a-zA-Z0-9\/\-_]+/g;
    patterns.apis = [...new Set((allText.match(apiRegex) || []))].slice(0, 10);

    // Product codes/SKUs
    const codeRegex = /\b[A-Z]{2,}\d{3,}\b|\b\d{3,}[A-Z]{2,}\b/g;
    patterns.codes = [...new Set((allText.match(codeRegex) || []))].slice(0, 20);

    return patterns;
  } catch (error) {
    console.error('Error extracting advanced patterns:', error);
    return {
      coordinates: [],
      ipAddresses: [],
      domains: [],
      creditCards: [],
      ssn: [],
      licenses: [],
      codes: [],
      ids: [],
      versions: [],
      apis: [],
      databases: [],
      protocols: []
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body: ScrapeRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    const { url, format = 'json', selectors } = body;

    // Validate required parameters
    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'URL is required and must be a string'
      }, { status: 400 });
    }

    // Validate format parameter
    const validFormats = ['text', 'json', 'csv', 'xml'];
    if (!validFormats.includes(format)) {
      return NextResponse.json({
        success: false,
        error: `Invalid format. Must be one of: ${validFormats.join(', ')}`
      }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.'
      }, { status: 400 });
    }

    // Check if URL uses valid protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({
        success: false,
        error: 'URL must use HTTP or HTTPS protocol'
      }, { status: 400 });
    }

    // Get ScraperAPI key from environment
    const scraperApiKey = process.env.SCRAPER_API_KEY;
    
    if (!scraperApiKey) {
      return NextResponse.json({
        success: false,
        error: 'ScraperAPI key not configured. Please add SCRAPER_API_KEY to your environment variables.'
      }, { status: 500 });
    }

    // Try enhanced ScraperAPI settings first, fallback to basic if needed
    const enhancedScraperApiUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true&wait=2000&country_code=us&device_type=desktop`;
    const basicScraperApiUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
    
    let response: Response;
    let usedBasicMode = false;
    
    // First attempt with enhanced parameters
    try {
      response = await fetch(enhancedScraperApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(45000)
      });
      
      // If we get a 400 error, try with basic parameters
      if (response.status === 400) {
        console.warn('Enhanced ScraperAPI parameters failed, trying basic mode');
        usedBasicMode = true;
        response = await fetch(basicScraperApiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(30000) // Shorter timeout for basic mode
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return NextResponse.json({
          success: false,
          error: 'Request timeout: The website took too long to respond'
        }, { status: 408 });
      }
      
      // If enhanced mode failed, try basic mode
      if (!usedBasicMode) {
        try {
          console.warn('Enhanced ScraperAPI request failed, trying basic mode');
          usedBasicMode = true;
          response = await fetch(basicScraperApiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(30000)
          });
        } catch (fallbackError) {
          return NextResponse.json({
            success: false,
            error: `Network error: ${fallbackError instanceof Error ? fallbackError.message : 'Unable to fetch the webpage'}`
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : 'Unable to fetch the webpage'}`
        }, { status: 500 });
      }
    }

    if (!response.ok) {
      let errorMessage = `ScraperAPI request failed: ${response.status} ${response.statusText}`;
      let responseBody = '';
      
      try {
        responseBody = await response.text();
        console.error('ScraperAPI error response:', responseBody);
      } catch (e) {
        console.error('Could not read error response body');
      }
      
      // Provide more specific error messages based on status codes
      switch (response.status) {
        case 400:
          errorMessage = `Bad request to ScraperAPI. This might be due to invalid parameters or malformed URL. Response: ${responseBody.substring(0, 200)}`;
          break;
        case 401:
          errorMessage = 'Invalid ScraperAPI key. Please check your SCRAPER_API_KEY environment variable.';
          break;
        case 403:
          errorMessage = 'Access forbidden. The website may be blocking scraping requests or your ScraperAPI plan may not support these features.';
          break;
        case 404:
          errorMessage = 'Website not found. Please check the URL and try again.';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please wait before making another request.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'The website is currently unavailable. Please try again later.';
          break;
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        debug: {
          status: response.status,
          statusText: response.statusText,
          mode: usedBasicMode ? 'basic' : 'enhanced',
          responseBody: responseBody.substring(0, 500)
        }
      }, { status: 400 });
    }

    let html: string;
    try {
      html = await response.text();
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to read response from the website'
      }, { status: 500 });
    }

    if (!html || html.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'The website returned empty content'
      }, { status: 400 });
    }

    let $: cheerio.CheerioAPI;
    try {
      $ = cheerio.load(html);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to parse HTML content'
      }, { status: 500 });
    }

    // Extract basic data with error handling
    let title: string;
    let headings: { h1: string[], h2: string[], h3: string[] };
    let paragraphs: string[];
    let rawLinks: any[];
    let images: any[];
    let meta: any;
    let allText: string;

    try {
      title = selectors?.title ? $(selectors.title).text().trim() : $('title').text().trim();
      title = title || 'Untitled Page';
    } catch (error) {
      console.warn('Error extracting title:', error);
      title = 'Untitled Page';
    }

    try {
      headings = {
        h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0),
        h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0),
        h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(text => text.length > 0),
      };
    } catch (error) {
      console.warn('Error extracting headings:', error);
      headings = { h1: [], h2: [], h3: [] };
    }

    try {
      // More aggressive paragraph extraction
      paragraphs = $('p, .content, .description, .summary, .text, .body-text, .article-content, .post-content, div[class*="content"], div[class*="text"]')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20 && text.length < 2000) // Filter for meaningful content
        .slice(0, 100); // Limit to prevent memory issues
    } catch (error) {
      console.warn('Error extracting paragraphs:', error);
      paragraphs = [];
    }

    try {
      // More aggressive link extraction with additional attributes
      rawLinks = $('a[href], area[href]').map((_, el) => ({
        text: $(el).text().trim(),
        href: $(el).attr('href'),
        title: $(el).attr('title') || '',
        target: $(el).attr('target') || '',
        rel: $(el).attr('rel') || '',
        class: $(el).attr('class') || '',
        id: $(el).attr('id') || '',
        ariaLabel: $(el).attr('aria-label') || ''
      })).get().filter(link => link.href && link.href.length > 0);
    } catch (error) {
      console.warn('Error extracting links:', error);
      rawLinks = [];
    }

    try {
      // More aggressive image extraction with additional attributes
      images = $('img[src], img[data-src], img[data-lazy-src], picture source[srcset]').map((_, el) => ({
        src: $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('srcset'),
        alt: $(el).attr('alt') || '',
        title: $(el).attr('title') || '',
        width: $(el).attr('width') || '',
        height: $(el).attr('height') || '',
        loading: $(el).attr('loading') || '',
        class: $(el).attr('class') || '',
        id: $(el).attr('id') || ''
      })).get().filter(img => img.src && img.src.length > 0);
    } catch (error) {
      console.warn('Error extracting images:', error);
      images = [];
    }

    try {
      // More comprehensive meta data extraction
      meta = {
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || '',
        viewport: $('meta[name="viewport"]').attr('content') || '',
        robots: $('meta[name="robots"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || '',
        ogTitle: $('meta[property="og:title"]').attr('content') || '',
        ogDescription: $('meta[property="og:description"]').attr('content') || '',
        ogImage: $('meta[property="og:image"]').attr('content') || '',
        ogUrl: $('meta[property="og:url"]').attr('content') || '',
        ogType: $('meta[property="og:type"]').attr('content') || '',
        twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
        twitterTitle: $('meta[name="twitter:title"]').attr('content') || '',
        twitterDescription: $('meta[name="twitter:description"]').attr('content') || '',
        twitterImage: $('meta[name="twitter:image"]').attr('content') || '',
        generator: $('meta[name="generator"]').attr('content') || '',
        theme: $('meta[name="theme-color"]').attr('content') || '',
        charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || ''
      };
    } catch (error) {
      console.warn('Error extracting meta data:', error);
      meta = { description: '', keywords: '', author: '', viewport: '', robots: '', canonical: '' };
    }

    try {
      // Get all text content for pattern matching
      allText = $('body').text();
    } catch (error) {
      console.warn('Error extracting body text:', error);
      allText = '';
    }

    // Extract and categorize contact information with error handling
    let contactInfo: any;
    try {
      contactInfo = extractContactInfo(allText, paragraphs);
    } catch (error) {
      console.warn('Error extracting contact info:', error);
      contactInfo = { phones: [], emails: [], addresses: [] };
    }
    
    // Categorize links with error handling
    let categorizedLinks: any;
    try {
      categorizedLinks = categorizeLinks(rawLinks);
    } catch (error) {
      console.warn('Error categorizing links:', error);
      categorizedLinks = { all: rawLinks, social: [], external: [], internal: [], email: [], phone: [], download: [] };
    }

    // Extract and categorize other data patterns with error handling
    let dataPatterns: any;
    try {
      dataPatterns = extractDataPatterns(allText);
    } catch (error) {
      console.warn('Error extracting data patterns:', error);
      dataPatterns = { dates: [], times: [], currencies: [], percentages: [], hashtags: [], mentions: [] };
    }

    // Extract business data aggressively
    let businessData: any;
    try {
      businessData = extractBusinessData($, allText);
    } catch (error) {
      console.warn('Error extracting business data:', error);
      businessData = { companyName: '', services: [], products: [], businessHours: [], pricing: [], team: [] };
    }

    // Extract technical data aggressively
    let technicalData: any;
    try {
      technicalData = extractTechnicalData($, html);
    } catch (error) {
      console.warn('Error extracting technical data:', error);
      technicalData = { technologies: [], frameworks: [], analytics: [], performance: {}, security: {}, seo: {} };
    }

    // Extract content data aggressively
    let contentData: any;
    try {
      contentData = extractContentData($, allText);
    } catch (error) {
      console.warn('Error extracting content data:', error);
      contentData = { forms: [], tables: [], multimedia: [], downloads: [], faqs: [], testimonials: [], navigation: [] };
    }

    // Extract advanced patterns aggressively
    let advancedPatterns: any;
    try {
      advancedPatterns = extractAdvancedPatterns(allText);
    } catch (error) {
      console.warn('Error extracting advanced patterns:', error);
      advancedPatterns = { coordinates: [], ipAddresses: [], domains: [], licenses: [], versions: [], apis: [], codes: [] };
    }

    // 🕸️ Calculate SEO Health Score
    let seoHealthScore: any;
    try {
      seoHealthScore = calculateSEOHealthScore($, meta, headings, allText, images);
    } catch (error) {
      console.warn('Error calculating SEO health score:', error);
      seoHealthScore = {
        overallScore: 0,
        maxPossibleScore: 100,
        healthLevel: 'Unknown',
        healthColor: '⚪',
        breakdown: {},
        recommendations: ['Error analyzing SEO factors'],
        lastAnalyzed: new Date().toISOString()
      };
    }

    // 📉 Extract Price Alert Data
    let priceAlertData: any;
    try {
      priceAlertData = extractPriceAlertData($, allText);
    } catch (error) {
      console.warn('Error extracting price alert data:', error);
      priceAlertData = {
        currentPrices: [],
        discounts: [],
        offers: [],
        saleIndicators: [],
        alertTriggers: [],
        summary: {
          totalPricesFound: 0,
          totalDiscountsFound: 0,
          totalOffersFound: 0,
          hasPriceDrops: false
        },
        lastScanned: new Date().toISOString()
      };
    }

    // 🧩 Analyze Content Blueprint
    let contentBlueprint: any;
    try {
      contentBlueprint = analyzeContentBlueprint($, allText, headings, paragraphs);
    } catch (error) {
      console.warn('Error analyzing content blueprint:', error);
      contentBlueprint = {
        contentTypes: {},
        contentVolume: {},
        contentQuality: {},
        contentStructure: {},
        contentStrategy: {},
        topicClusters: [],
        readabilityAnalysis: {},
        engagementElements: {},
        contentGaps: []
      };
    }

    // Structure the data in a more organized format
    const extractedData = {
      // Page metadata
      page: {
        title,
        url: parsedUrl.href,
        domain: parsedUrl.hostname,
        protocol: parsedUrl.protocol,
        lastScraped: new Date().toISOString()
      },
      
      // SEO and meta information
      seo: {
        meta,
        headings: {
          ...headings,
          total: headings.h1.length + headings.h2.length + headings.h3.length
        }
      },
      
      // Main content structure
      content: {
        paragraphs: {
          items: paragraphs,
          count: paragraphs.length,
          totalWords: paragraphs.join(' ').split(' ').filter(word => word.length > 0).length,
          averageLength: paragraphs.length > 0 ? Math.round(paragraphs.join(' ').length / paragraphs.length) : 0
        },
        readabilityScore: calculateReadabilityScore(paragraphs.join(' ')),
        contentDensity: paragraphs.length > 0 ? 'high' : 'low'
      },
      
      // Contact information with validation
      contact: {
        ...contactInfo,
        hasContactInfo: contactInfo.phones.length > 0 || contactInfo.emails.length > 0 || contactInfo.addresses.length > 0,
        contactScore: calculateContactScore(contactInfo)
      },
      
      // Categorized and analyzed links
      links: {
        ...categorizedLinks,
        analytics: {
          totalLinks: categorizedLinks.all.length,
          externalRatio: categorizedLinks.all.length > 0 ? 
            Math.round((categorizedLinks.external.length / categorizedLinks.all.length) * 100) : 0,
          internalRatio: categorizedLinks.all.length > 0 ? 
            Math.round((categorizedLinks.internal.length / categorizedLinks.all.length) * 100) : 0,
          hasContactLinks: categorizedLinks.email.length > 0 || categorizedLinks.phone.length > 0,
          hasSocialPresence: categorizedLinks.social.length > 0,
          downloadableContent: categorizedLinks.download.length > 0
        }
      },
      
      // Media and visual content
      media: {
        images: {
          items: images,
          count: images.length,
          withAltText: images.filter(img => img.alt && img.alt.length > 0).length,
          accessibilityScore: images.length > 0 ? 
            Math.round((images.filter(img => img.alt && img.alt.length > 0).length / images.length) * 100) : 100
        },
        multimedia: contentData.multimedia,
        downloads: contentData.downloads
      },

      // Business intelligence data
      business: {
        ...businessData,
        hasBusinessInfo: businessData.companyName.length > 0 || 
                        businessData.services.length > 0 || 
                        businessData.products.length > 0,
        commercialIndicators: {
          hasPricing: businessData.pricing.length > 0,
          hasTeam: businessData.team.length > 0,
          hasBusinessHours: businessData.businessHours.length > 0,
          hasServices: businessData.services.length > 0,
          hasProducts: businessData.products.length > 0
        }
      },

      // Technical analysis
      technical: {
        ...technicalData,
        totalTechnologies: technicalData.technologies.length + technicalData.frameworks.length,
        hasAdvancedFeatures: technicalData.technologies.length > 3 || 
                            technicalData.analytics.length > 0 ||
                            technicalData.security.contentSecurityPolicy
      },

      // Interactive content
      interactive: {
        forms: contentData.forms,
        tables: contentData.tables,
        navigation: contentData.navigation,
        faqs: contentData.faqs,
        testimonials: contentData.testimonials,
        breadcrumbs: contentData.breadcrumbs,
        hasInteractivity: contentData.forms.length > 0 || 
                         contentData.tables.length > 0 ||
                         contentData.faqs.length > 0
      },
      
      // Data patterns and insights
      insights: {
        patterns: {
          ...dataPatterns,
          ...advancedPatterns,
          hasTemporalData: dataPatterns.dates.length > 0 || dataPatterns.times.length > 0,
          hasFinancialData: dataPatterns.currencies.length > 0 || dataPatterns.percentages.length > 0,
          hasSocialElements: dataPatterns.hashtags.length > 0 || dataPatterns.mentions.length > 0,
          hasLocationData: advancedPatterns.coordinates.length > 0,
          hasTechnicalData: advancedPatterns.ipAddresses.length > 0 || 
                           advancedPatterns.apis.length > 0 ||
                           advancedPatterns.versions.length > 0,
          hasBusinessCodes: advancedPatterns.licenses.length > 0 || advancedPatterns.codes.length > 0
        },
        contentType: determineContentType(title, headings, paragraphs, categorizedLinks),
        businessType: determineBusinessType(contactInfo, categorizedLinks, dataPatterns),
        technicalComplexity: calculateTechnicalComplexity(allText),
        dataRichness: {
          businessDataScore: (businessData.services.length + businessData.products.length + businessData.team.length) / 3,
          technicalDataScore: (technicalData.technologies.length + technicalData.frameworks.length + technicalData.analytics.length) / 3,
          interactiveScore: (contentData.forms.length + contentData.tables.length + contentData.faqs.length) / 3,
          overallScore: Math.round(((businessData.services.length + businessData.products.length + businessData.team.length + 
                                   technicalData.technologies.length + technicalData.frameworks.length + technicalData.analytics.length +
                                   contentData.forms.length + contentData.tables.length + contentData.faqs.length) / 9) * 100) / 100
        }
      },
      
      // 🕸️ SEO Health Analysis
      seoHealth: {
        ...seoHealthScore,
        lastAnalyzed: new Date().toISOString()
      },

      // 📉 Price Alert & Tracking
      priceTracking: {
        ...priceAlertData,
        hasPriceAlerts: priceAlertData.alertTriggers.length > 0,
        priceDropDetected: priceAlertData.alertTriggers.some((alert: any) => alert.type === 'price_drop'),
        highDiscountDetected: priceAlertData.alertTriggers.some((alert: any) => alert.type === 'high_discount')
      },

      // 🧩 Content Blueprint & Strategy
      contentBlueprint: {
        ...contentBlueprint,
        overallContentScore: Math.round((
          (contentBlueprint.contentQuality?.overallScore || 0) +
          (contentBlueprint.engagementElements?.engagementScore || 0) +
          (contentBlueprint.contentStructure?.flowScore || 0)
        ) / 3),
        lastAnalyzed: new Date().toISOString()
      },
      
      // Page statistics and summary
      summary: {
        totalElements: headings.h1.length + headings.h2.length + headings.h3.length + 
                      paragraphs.length + categorizedLinks.all.length + images.length,
        contentRichness: calculateContentRichness(headings, paragraphs, categorizedLinks, images),
        dataQuality: calculateDataQuality(title, meta, headings, paragraphs),
        scrapingDifficulty: calculateScrapingDifficulty(categorizedLinks, images, allText),
        // Enhanced summary with new metrics
        seoScore: seoHealthScore.overallScore,
        contentScore: Math.round((
          (contentBlueprint.contentQuality?.overallScore || 0) +
          (contentBlueprint.engagementElements?.engagementScore || 0) +
          (contentBlueprint.contentStructure?.flowScore || 0)
        ) / 3),
        priceAlertsActive: priceAlertData.alertTriggers.length > 0,
        commercialValue: priceAlertData.summary.totalPricesFound > 0 || 
                        businessData.services.length > 0 || 
                        businessData.products.length > 0
      }
    };

    // Add custom selectors if provided
    if (selectors?.custom) {
      Object.entries(selectors.custom).forEach(([key, selector]) => {
        try {
          (extractedData as any)[key] = $(selector).map((_, el) => $(el).text().trim()).get();
        } catch (error) {
          console.warn(`Invalid selector for ${key}: ${selector}`);
        }
      });
    }

    // 🤖 AI-Enhanced Analysis
    let enhancedData = extractedData;
    try {
      enhancedData = await enhanceDataWithAI(extractedData, allText);
    } catch (error) {
      console.warn('AI enhancement failed, using standard extraction:', error);
    }

    const elementsFound = 
      enhancedData.seo.headings.h1.length + 
      enhancedData.seo.headings.h2.length + 
      enhancedData.seo.headings.h3.length + 
      enhancedData.content.paragraphs.count + 
      enhancedData.links.all.length + 
      enhancedData.media.images.count +
      enhancedData.contact.phones.length +
      extractedData.contact.emails.length +
      extractedData.business.services.length +
      extractedData.business.products.length +
      extractedData.business.team.length +
      extractedData.technical.technologies.length +
      extractedData.technical.frameworks.length +
      extractedData.interactive.forms.length +
      extractedData.interactive.tables.length +
      extractedData.interactive.faqs.length +
      extractedData.media.multimedia.length +
      extractedData.media.downloads.length;

    const metadata = {
      url,
      timestamp: new Date().toISOString(),
      format,
      elementsFound,
      scraperUsed: usedBasicMode ? 'ScraperAPI (Basic)' : 'ScraperAPI (Enhanced)',
      aiEnhanced: !!(enhancedData as any).aiInsights,
      aiModel: (enhancedData as any).aiInsights?.model || null
    };

    // Format the output based on requested format
    let formattedData;
    switch (format) {
      case 'text':
        formattedData = formatAsText(enhancedData);
        break;
      case 'csv':
        formattedData = formatAsCSV(enhancedData);
        break;
      case 'xml':
        formattedData = formatAsXML(enhancedData);
        break;
      case 'json':
      default:
        formattedData = enhancedData;
        break;
    }

    // Create or update project for the user
    try {
      const { user } = await getServerSession();
      if (user?.uid) {
        // Create a project for this scraping session
        const projectName = `DataShark Analysis - ${new URL(url).hostname}`;
        const projectDescription = `Web scraping analysis of ${url} using DataShark AI`;
        
        const project = await ProjectService.createProject({
          name: projectName,
          description: projectDescription,
          user_id: user.uid,
          category: 'analysis', // default category
          is_public: false, // default to private
          tags: [], // default empty tags
          status: 'active' // default status
        });

        // Update project with data scraped count
        if (project.id) {
          const dataPoints = metadata.elementsFound || 0;
          await ProjectService.updateDataScraped(project.id, dataPoints, url);
        }
      }
    } catch (projectError) {
      console.error('Error creating project for DataShark:', projectError);
      // Don't fail the scraping request if project creation fails
    }

    const result: ScrapeResult = {
      success: true,
      data: formattedData,
      metadata
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('DataShark scraping error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Helper function to extract contact information
function extractContactInfo(text: string, paragraphs: string[]) {
  try {
    const phoneRegex = /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+?[1-9]\d{1,14})/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const addressRegex = /\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl|Way|Circle|Cir|Square|Sq)\b[A-Za-z0-9\s,.-]*(?:\d{5}(?:-\d{4})?)?/gi;

    const phones = [...new Set((text || '').match(phoneRegex) || [])];
    const emails = [...new Set((text || '').match(emailRegex) || [])];
    const addresses = [...new Set((text || '').match(addressRegex) || [])];

    return {
      phones: phones.filter(phone => phone && phone.length >= 10),
      emails: emails.filter(email => email && email.includes('@')),
      addresses: addresses.filter(addr => addr && addr.length > 10).slice(0, 5) // Limit to prevent false positives
    };
  } catch (error) {
    console.warn('Error in extractContactInfo:', error);
    return {
      phones: [],
      emails: [],
      addresses: []
    };
  }
}

// Helper function to categorize links
function categorizeLinks(links: any[]) {
  try {
    const social: any[] = [];
    const external: any[] = [];
    const internal: any[] = [];
    const email: any[] = [];
    const phone: any[] = [];
    const download: any[] = [];

    if (!Array.isArray(links)) {
      console.warn('categorizeLinks: links is not an array');
      return { all: [], social, external, internal, email, phone, download };
    }

    const socialDomains = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'tiktok.com', 'pinterest.com', 'snapchat.com', 'whatsapp.com', 'telegram.org'];
    const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.tar', '.gz'];

    for (const link of links) {
      try {
        if (!link || typeof link !== 'object') continue;
        
        const href = link.href?.toLowerCase() || '';
        const text = link.text?.toLowerCase() || '';

        if (!href) continue;

        if (href.startsWith('mailto:')) {
          email.push(link);
        } else if (href.startsWith('tel:') || href.startsWith('phone:')) {
          phone.push(link);
        } else if (downloadExtensions.some(ext => href.includes(ext))) {
          download.push(link);
        } else if (socialDomains.some(domain => href.includes(domain))) {
          social.push(link);
        } else if (href.startsWith('http') || href.startsWith('https')) {
          external.push(link);
        } else if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
          internal.push(link);
        } else {
          external.push(link);
        }
      } catch (linkError) {
        console.warn('Error processing link:', linkError);
        continue;
      }
    }

    return {
      social,
      external,
      internal,
      email,
      phone,
      download,
      all: links
    };
  } catch (error) {
    console.warn('Error in categorizeLinks:', error);
    return {
      all: links || [],
      social: [],
      external: [],
      internal: [],
      email: [],
      phone: [],
      download: []
    };
  }
}

// Helper function to extract data patterns
function extractDataPatterns(text: string) {
  try {
    const safeText = text || '';
    
    const dateRegex = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g;
    const timeRegex = /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/g;
    const currencyRegex = /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP|CAD|AUD)/g;
    const percentageRegex = /\d+(?:\.\d+)?%/g;
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const mentionRegex = /@[a-zA-Z0-9_]+/g;

    return {
      dates: [...new Set(safeText.match(dateRegex) || [])],
      times: [...new Set(safeText.match(timeRegex) || [])],
      currencies: [...new Set(safeText.match(currencyRegex) || [])],
      percentages: [...new Set(safeText.match(percentageRegex) || [])],
      hashtags: [...new Set(safeText.match(hashtagRegex) || [])],
      mentions: [...new Set(safeText.match(mentionRegex) || [])]
    };
  } catch (error) {
    console.warn('Error in extractDataPatterns:', error);
    return {
      dates: [],
      times: [],
      currencies: [],
      percentages: [],
      hashtags: [],
      mentions: []
    };
  }
}

function formatAsText(data: any): string {
  try {
    let text = '';
    
    // Helper function to pad text for alignment
    const padRight = (str: string, length: number) => {
      return str.length >= length ? str : str + ' '.repeat(length - str.length);
    };
    
    const padLeft = (str: string, length: number) => {
      return str.length >= length ? str : ' '.repeat(length - str.length) + str;
    };
    
    const wrapText = (text: string, maxWidth: number, indent: string = '') => {
      if (text.length <= maxWidth) return indent + text;
      
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + word).length <= maxWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(indent + currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(indent + currentLine);
      
      return lines.join('\n');
    };
    
    // Page Information Header
    text += '╔' + '═'.repeat(78) + '╗\n';
    text += '║' + padRight('', 78) + '║\n';
    text += '║' + padRight('                 AI-ENHANCED WEBSITE ANALYSIS', 78) + '║\n';
    text += '║' + padRight('', 78) + '║\n';
    text += '╚' + '═'.repeat(78) + '╝\n\n';
    
    // Basic Information Section
    text += '┌─ 📄 BASIC INFORMATION ' + '─'.repeat(54) + '\n';
    if (data.page?.title) {
      text += '│ Title      : ' + data.page.title + '\n';
    }
    if (data.page?.url) {
      text += '│ URL        : ' + data.page.url + '\n';
    }
    if (data.page?.domain) {
      text += '│ Domain     : ' + data.page.domain + '\n';
    }
    if (data.page?.protocol) {
      text += '│ Protocol   : ' + data.page.protocol.toUpperCase() + '\n';
    }
    if (data.page?.lastScraped) {
      text += '│ Scraped    : ' + new Date(data.page.lastScraped).toLocaleString() + '\n';
    }
    text += '└' + '─'.repeat(78) + '\n\n';
    
    // AI Insights Section
    if (data.aiInsights) {
      text += '┌─ 🤖 AI BUSINESS INTELLIGENCE ' + '─'.repeat(47) + '\n';
      text += '│\n';
      
      if (data.aiInsights.businessIntelligence) {
        const bi = data.aiInsights.businessIntelligence;
        text += '│ ┌─ Business Analysis ─────────────────────────────────────┐\n';
        if (bi.industry) text += '│ │ Industry: ' + bi.industry + '\n';
        if (bi.businessModel) text += '│ │ Business Model: ' + bi.businessModel + '\n';
        if (bi.targetAudience) text += '│ │ Target Audience: ' + bi.targetAudience + '\n';
        if (bi.competitiveAdvantages?.length > 0) {
          text += '│ │ Competitive Advantages:\n';
          bi.competitiveAdvantages.forEach((adv: string) => {
            text += '│ │   • ' + adv + '\n';
          });
        }
        text += '│ └────────────────────────────────────────────────────────┘\n';
        text += '│\n';
      }
      
      if (data.aiInsights.contentAnalysis) {
        const ca = data.aiInsights.contentAnalysis;
        text += '│ ┌─ Content Analysis ──────────────────────────────────────┐\n';
        if (ca.qualityScore) text += '│ │ Quality Score: ' + ca.qualityScore + '/10\n';
        if (ca.primaryTopics?.length > 0) {
          text += '│ │ Primary Topics: ' + ca.primaryTopics.join(', ') + '\n';
        }
        if (ca.contentGaps?.length > 0) {
          text += '│ │ Content Gaps:\n';
          ca.contentGaps.forEach((gap: string) => {
            text += '│ │   • ' + gap + '\n';
          });
        }
        text += '│ └────────────────────────────────────────────────────────┘\n';
        text += '│\n';
      }
      
      if (data.aiInsights.technicalInsights) {
        const ti = data.aiInsights.technicalInsights;
        text += '│ ┌─ Technical Assessment ──────────────────────────────────┐\n';
        if (ti.performanceIndicators?.length > 0) {
          text += '│ │ Performance Indicators:\n';
          ti.performanceIndicators.forEach((indicator: string) => {
            text += '│ │   • ' + indicator + '\n';
          });
        }
        if (ti.securityAssessment) text += '│ │ Security: ' + ti.securityAssessment + '\n';
        if (ti.mobileReadiness) text += '│ │ Mobile Ready: ' + ti.mobileReadiness + '\n';
        text += '│ └────────────────────────────────────────────────────────┘\n';
        text += '│\n';
      }
      
      if (data.aiInsights.actionableInsights?.businessOpportunities?.length > 0) {
        text += '│ ┌─ Business Opportunities ────────────────────────────────┐\n';
        data.aiInsights.actionableInsights.businessOpportunities.forEach((opp: string) => {
          text += '│ │ • ' + opp + '\n';
        });
        text += '│ └────────────────────────────────────────────────────────┘\n';
        text += '│\n';
      }
      
      text += '└' + '─'.repeat(78) + '\n\n';
    }
    
    // Summary Statistics Section
    if (data.summary) {
      text += '┌─ 📊 SUMMARY STATISTICS ' + '─'.repeat(53) + '\n';
      text += '│\n';
      text += '│ ┌─ Metrics ─────────────────┬─ Values ──────────────────┐\n';
      text += '│ │ Total Elements Found      │ ' + padLeft(data.summary.totalElements.toString(), 25) + ' │\n';
      text += '│ │ Content Richness          │ ' + padLeft(data.summary.contentRichness, 25) + ' │\n';
      text += '│ │ Data Quality Score        │ ' + padLeft(`${data.summary.dataQuality}/100`, 25) + ' │\n';
      text += '│ │ Scraping Difficulty       │ ' + padLeft(data.summary.scrapingDifficulty, 25) + ' │\n';
      text += '│ └───────────────────────────┴───────────────────────────┘\n';
      text += '│\n';
      text += '└' + '─'.repeat(78) + '\n\n';
    }
    
    // SEO Information Section
    if (data.seo?.meta?.description || data.seo?.meta?.keywords) {
      text += '┌─ 🎯 SEO INFORMATION ' + '─'.repeat(56) + '\n';
      text += '│\n';
      if (data.seo.meta.description) {
        text += '│ Meta Description:\n';
        const wrappedDesc = wrapText(data.seo.meta.description, 74, '│   ');
        text += wrappedDesc + '\n';
        text += '│\n';
      }
      if (data.seo.meta.keywords) {
        text += '│ Keywords: ' + data.seo.meta.keywords + '\n';
        text += '│\n';
      }
      if (data.seo.healthScore) {
        text += '│ SEO Health Score: ' + data.seo.healthScore.overall + '/100\n';
        text += '│\n';
      }
      text += '└' + '─'.repeat(78) + '\n\n';
    }
    
    // Headings Structure Section
    if (data.seo?.headings) {
      const headings = data.seo.headings;
      if (headings.h1?.length > 0 || headings.h2?.length > 0 || headings.h3?.length > 0) {
        text += '┌─ 📋 HEADING STRUCTURE ' + '─'.repeat(54) + '\n';
        text += '│\n';
        text += '│ Total Headings: ' + (headings.total || 0) + '\n';
        text += '│\n';
        
        if (headings.h1?.length > 0) {
          text += '│ ┌─ H1 HEADINGS (' + headings.h1.length + ') ' + '─'.repeat(Math.max(0, 60 - headings.h1.length.toString().length)) + '\n';
          headings.h1.forEach((h: string, i: number) => {
            const wrappedHeading = wrapText(`${padLeft((i + 1).toString(), 2)}. ${h}`, 74, '│ │ ');
            text += wrappedHeading + '\n';
          });
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        if (headings.h2?.length > 0) {
          text += '│ ┌─ H2 HEADINGS (' + headings.h2.length + ') ' + '─'.repeat(Math.max(0, 60 - headings.h2.length.toString().length)) + '\n';
          headings.h2.forEach((h: string, i: number) => {
            const wrappedHeading = wrapText(`${padLeft((i + 1).toString(), 2)}. ${h}`, 74, '│ │ ');
            text += wrappedHeading + '\n';
          });
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        if (headings.h3?.length > 0) {
          text += '│ ┌─ H3 HEADINGS (' + headings.h3.length + ') ' + '─'.repeat(Math.max(0, 60 - headings.h3.length.toString().length)) + '\n';
          headings.h3.forEach((h: string, i: number) => {
            const wrappedHeading = wrapText(`${padLeft((i + 1).toString(), 2)}. ${h}`, 74, '│ │ ');
            text += wrappedHeading + '\n';
          });
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        text += '└' + '─'.repeat(78) + '\n\n';
      }
    }
    
    // Content Preview Section
    if (data.content?.paragraphs?.items?.length > 0) {
      const paragraphs = data.content.paragraphs;
      text += '┌─ 📝 CONTENT PREVIEW ' + '─'.repeat(56) + '\n';
      text += '│\n';
      text += '│ Showing first ' + Math.min(3, paragraphs.items.length) + ' paragraphs:\n';
      text += '│\n';
      
      paragraphs.items.slice(0, 3).forEach((p: string, i: number) => {
        text += '│ ┌─ Paragraph ' + (i + 1) + ' ' + '─'.repeat(Math.max(0, 64 - (i + 1).toString().length)) + '\n';
        const preview = p.length > 200 ? p.substring(0, 200) + '...' : p;
        const wrappedPreview = wrapText(preview, 74, '│ │ ');
        text += wrappedPreview + '\n';
        text += '│ └' + '─'.repeat(76) + '\n';
        if (i < Math.min(2, paragraphs.items.length - 1)) {
          text += '│\n';
        }
      });
      
      if (paragraphs.items.length > 3) {
        text += '│\n';
        text += '│ ... and ' + (paragraphs.items.length - 3) + ' more paragraphs\n';
      }
      text += '│\n';
      text += '└' + '─'.repeat(78) + '\n\n';
    }

    // Contact Information Section
    if (data.contact && data.contact.hasContactInfo) {
      text += '┌─ 📞 CONTACT INFORMATION ' + '─'.repeat(52) + '\n';
      text += '│\n';
      text += '│ Contact Score: ' + data.contact.contactScore + '/100\n';
      text += '│\n';
      
      if (data.contact.phones?.length > 0) {
        text += '│ ┌─ 📱 PHONE NUMBERS (' + data.contact.phones.length + ') ' + '─'.repeat(Math.max(0, 56 - data.contact.phones.length.toString().length)) + '\n';
        data.contact.phones.forEach((phone: string, i: number) => {
          text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + phone + '\n';
        });
        text += '│ └' + '─'.repeat(76) + '\n';
        text += '│\n';
      }
      
      if (data.contact.emails?.length > 0) {
        text += '│ ┌─ 📧 EMAIL ADDRESSES (' + data.contact.emails.length + ') ' + '─'.repeat(Math.max(0, 54 - data.contact.emails.length.toString().length)) + '\n';
        data.contact.emails.forEach((email: string, i: number) => {
          text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + email + '\n';
        });
        text += '│ └' + '─'.repeat(76) + '\n';
        text += '│\n';
      }
      
      if (data.contact.addresses?.length > 0) {
        text += '│ ┌─ 📍 ADDRESSES (' + data.contact.addresses.length + ') ' + '─'.repeat(Math.max(0, 60 - data.contact.addresses.length.toString().length)) + '\n';
        data.contact.addresses.forEach((addr: string, i: number) => {
          const wrappedAddr = wrapText(`${padLeft((i + 1).toString(), 2)}. ${addr}`, 74, '│ │ ');
          text += wrappedAddr + '\n';
        });
        text += '│ └' + '─'.repeat(76) + '\n';
        text += '│\n';
      }
      text += '└' + '─'.repeat(78) + '\n\n';
    }

    // Link Analysis Section
    if (data.links && data.links.analytics) {
      text += '┌─ 🔗 LINK ANALYSIS ' + '─'.repeat(58) + '\n';
      text += '│\n';
      text += '│ ┌─ Link Statistics ──────────────────────────────────────┐\n';
      text += '│ │ Total Links         : ' + padLeft(data.links.analytics.totalLinks.toString(), 31) + ' │\n';
      text += '│ │ External Links      : ' + padLeft(`${data.links.external?.length || 0} (${data.links.analytics.externalRatio}%)`, 31) + ' │\n';
      text += '│ │ Internal Links      : ' + padLeft(`${data.links.internal?.length || 0} (${data.links.analytics.internalRatio}%)`, 31) + ' │\n';
      text += '│ │ Social Presence     : ' + padLeft(data.links.analytics.hasSocialPresence ? 'Yes' : 'No', 31) + ' │\n';
      text += '│ │ Contact Links       : ' + padLeft(data.links.analytics.hasContactLinks ? 'Yes' : 'No', 31) + ' │\n';
      text += '│ │ Downloadable Content: ' + padLeft(data.links.analytics.downloadableContent ? 'Yes' : 'No', 31) + ' │\n';
      text += '│ └────────────────────────────────────────────────────────┘\n';
      text += '│\n';
      
      // Categorized Links (showing counts and samples)
      const linkCategories = [
        { key: 'social', name: 'SOCIAL MEDIA', emoji: '🌐' },
        { key: 'external', name: 'EXTERNAL', emoji: '🔗' },
        { key: 'internal', name: 'INTERNAL', emoji: '🏠' },
        { key: 'download', name: 'DOWNLOADS', emoji: '📥' },
        { key: 'email', name: 'EMAIL', emoji: '📧' },
        { key: 'phone', name: 'PHONE', emoji: '📞' }
      ];
      
      linkCategories.forEach(category => {
        const links = data.links[category.key];
        if (links && links.length > 0) {
          const displayCount = Math.min(3, links.length);
          text += '│ ┌─ ' + category.emoji + ' ' + category.name + ' LINKS (' + links.length + ') ' + 
                  '─'.repeat(Math.max(0, 66 - category.name.length - links.length.toString().length)) + '\n';
          
          links.slice(0, displayCount).forEach((link: any, i: number) => {
            const linkText = link.text || 'No text';
            const displayText = linkText.length > 40 ? linkText.substring(0, 40) + '...' : linkText;
            text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + displayText + '\n';
            const wrappedHref = wrapText('→ ' + link.href, 74, '│ │    ');
            text += wrappedHref + '\n';
            if (i < displayCount - 1) text += '│ │\n';
          });
          
          if (links.length > displayCount) {
            text += '│ │\n';
            text += '│ │ ... and ' + (links.length - displayCount) + ' more links\n';
          }
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
      });
      text += '└' + '─'.repeat(78) + '\n\n';
    }

    // Media Analysis Section
    if (data.media?.images && data.media.images.count > 0) {
      text += '┌─ 🖼️ MEDIA ANALYSIS ' + '─'.repeat(57) + '\n';
      text += '│\n';
      text += '│ ┌─ Image Statistics ─────────────────────────────────────┐\n';
      text += '│ │ Total Images        : ' + padLeft(data.media.images.count.toString(), 31) + ' │\n';
      text += '│ │ Images with Alt Text: ' + padLeft(data.media.images.withAltText.toString(), 31) + ' │\n';
      text += '│ │ Accessibility Score : ' + padLeft(data.media.images.accessibilityScore + '%', 31) + ' │\n';
      text += '│ └────────────────────────────────────────────────────────┘\n';
      text += '│\n';
      text += '└' + '─'.repeat(78) + '\n\n';
    }

    // Data Patterns Section
    if (data.insights?.patterns) {
      const patterns = data.insights.patterns;
      const hasPatterns = patterns.dates?.length > 0 || patterns.times?.length > 0 || 
                         patterns.currencies?.length > 0 || patterns.hashtags?.length > 0;
      
      if (hasPatterns) {
        text += '┌─ 🔍 DATA PATTERNS ' + '─'.repeat(58) + '\n';
        text += '│\n';
        text += '│ ┌─ Pattern Overview ─────────────────────────────────────┐\n';
        text += '│ │ Temporal Data       : ' + padLeft(patterns.hasTemporalData ? 'Yes' : 'No', 31) + ' │\n';
        text += '│ │ Financial Data      : ' + padLeft(patterns.hasFinancialData ? 'Yes' : 'No', 31) + ' │\n';
        text += '│ │ Social Elements     : ' + padLeft(patterns.hasSocialElements ? 'Yes' : 'No', 31) + ' │\n';
        text += '│ └────────────────────────────────────────────────────────┘\n';
        text += '│\n';
        
        if (patterns.dates?.length > 0) {
          const displayCount = Math.min(5, patterns.dates.length);
          text += '│ ┌─ 📅 DATES (' + patterns.dates.length + ') ' + '─'.repeat(Math.max(0, 67 - patterns.dates.length.toString().length)) + '\n';
          patterns.dates.slice(0, displayCount).forEach((date: string, i: number) => {
            text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + date + '\n';
          });
          if (patterns.dates.length > displayCount) {
            text += '│ │ ... and ' + (patterns.dates.length - displayCount) + ' more dates\n';
          }
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        if (patterns.times?.length > 0) {
          const displayCount = Math.min(5, patterns.times.length);
          text += '│ ┌─ ⏰ TIMES (' + patterns.times.length + ') ' + '─'.repeat(Math.max(0, 67 - patterns.times.length.toString().length)) + '\n';
          patterns.times.slice(0, displayCount).forEach((time: string, i: number) => {
            text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + time + '\n';
          });
          if (patterns.times.length > displayCount) {
            text += '│ │ ... and ' + (patterns.times.length - displayCount) + ' more times\n';
          }
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        if (patterns.currencies?.length > 0) {
          const displayCount = Math.min(5, patterns.currencies.length);
          text += '│ ┌─ 💰 CURRENCIES/PRICES (' + patterns.currencies.length + ') ' + '─'.repeat(Math.max(0, 53 - patterns.currencies.length.toString().length)) + '\n';
          patterns.currencies.slice(0, displayCount).forEach((curr: string, i: number) => {
            text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + curr + '\n';
          });
          if (patterns.currencies.length > displayCount) {
            text += '│ │ ... and ' + (patterns.currencies.length - displayCount) + ' more currencies\n';
          }
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        if (patterns.hashtags?.length > 0) {
          const displayCount = Math.min(8, patterns.hashtags.length);
          text += '│ ┌─ #️⃣ HASHTAGS (' + patterns.hashtags.length + ') ' + '─'.repeat(Math.max(0, 62 - patterns.hashtags.length.toString().length)) + '\n';
          patterns.hashtags.slice(0, displayCount).forEach((tag: string, i: number) => {
            text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + tag + '\n';
          });
          if (patterns.hashtags.length > displayCount) {
            text += '│ │ ... and ' + (patterns.hashtags.length - displayCount) + ' more hashtags\n';
          }
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        if (patterns.mentions?.length > 0) {
          const displayCount = Math.min(5, patterns.mentions.length);
          text += '│ ┌─ @ MENTIONS (' + patterns.mentions.length + ') ' + '─'.repeat(Math.max(0, 63 - patterns.mentions.length.toString().length)) + '\n';
          patterns.mentions.slice(0, displayCount).forEach((mention: string, i: number) => {
            text += '│ │ ' + padLeft((i + 1).toString(), 2) + '. ' + mention + '\n';
          });
          if (patterns.mentions.length > displayCount) {
            text += '│ │ ... and ' + (patterns.mentions.length - displayCount) + ' more mentions\n';
          }
          text += '│ └' + '─'.repeat(76) + '\n';
          text += '│\n';
        }
        
        text += '└' + '─'.repeat(78) + '\n\n';
      }
    }
    
    // Footer
    text += '╔' + '═'.repeat(78) + '╗\n';
    text += '║' + padRight('', 78) + '║\n';
    text += '║' + padRight('                    END OF ANALYSIS REPORT', 78) + '║\n';
    text += '║' + padRight('', 78) + '║\n';
    text += '║' + padRight('                Generated by DataShark Web Scraper', 78) + '║\n';
    text += '║' + padRight('                     ' + new Date().toLocaleString(), 78) + '║\n';
    text += '║' + padRight('', 78) + '║\n';
    text += '╚' + '═'.repeat(78) + '╝';
    
    return text.trim();
  } catch (error) {
    console.error('Error formatting text:', error);
    return `ERROR: Failed to format text output - ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

function formatAsCSV(data: any): string {
  try {
    const rows = [];
    rows.push('Type,Category,Content,URL,Additional,Score');
    
    // Basic Information
    if (data.page?.title) {
      rows.push(`Page,Title,"${data.page.title.replace(/"/g, '""')}","${data.page?.url || ''}","",""`);
    }
    if (data.page?.domain) {
      rows.push(`Page,Domain,"${data.page.domain}","","",""`);
    }
    
    // AI Insights
    if (data.aiInsights) {
      if (data.aiInsights.businessIntelligence) {
        const bi = data.aiInsights.businessIntelligence;
        if (bi.industry) rows.push(`AI,Industry,"${bi.industry.replace(/"/g, '""')}","","",""`);
        if (bi.businessModel) rows.push(`AI,BusinessModel,"${bi.businessModel.replace(/"/g, '""')}","","",""`);
        if (bi.targetAudience) rows.push(`AI,TargetAudience,"${bi.targetAudience.replace(/"/g, '""')}","","",""`);
        if (bi.competitiveAdvantages?.length > 0) {
          bi.competitiveAdvantages.forEach((adv: string) => 
            rows.push(`AI,CompetitiveAdvantage,"${adv.replace(/"/g, '""')}","","",""`));
        }
      }
      
      if (data.aiInsights.contentAnalysis) {
        const ca = data.aiInsights.contentAnalysis;
        if (ca.qualityScore) rows.push(`AI,ContentQuality,"Quality Assessment","","","${ca.qualityScore}/10"`);
        if (ca.primaryTopics?.length > 0) {
          ca.primaryTopics.forEach((topic: string) => 
            rows.push(`AI,PrimaryTopic,"${topic.replace(/"/g, '""')}","","",""`));
        }
        if (ca.contentGaps?.length > 0) {
          ca.contentGaps.forEach((gap: string) => 
            rows.push(`AI,ContentGap,"${gap.replace(/"/g, '""')}","","",""`));
        }
      }
      
      if (data.aiInsights.technicalInsights) {
        const ti = data.aiInsights.technicalInsights;
        if (ti.performanceIndicators?.length > 0) {
          ti.performanceIndicators.forEach((indicator: string) => 
            rows.push(`AI,PerformanceIndicator,"${indicator.replace(/"/g, '""')}","","",""`));
        }
        if (ti.securityAssessment) rows.push(`AI,Security,"${ti.securityAssessment.replace(/"/g, '""')}","","",""`);
        if (ti.mobileReadiness) rows.push(`AI,MobileReadiness,"${ti.mobileReadiness.replace(/"/g, '""')}","","",""`);
      }
      
      if (data.aiInsights.actionableInsights?.businessOpportunities?.length > 0) {
        data.aiInsights.actionableInsights.businessOpportunities.forEach((opp: string) => 
          rows.push(`AI,BusinessOpportunity,"${opp.replace(/"/g, '""')}","","",""`));
      }
    }
    
    // SEO Information
    if (data.seo?.meta?.description) {
      rows.push(`SEO,MetaDescription,"${data.seo.meta.description.replace(/"/g, '""')}","","",""`);
    }
    if (data.seo?.meta?.keywords) {
      rows.push(`SEO,Keywords,"${data.seo.meta.keywords.replace(/"/g, '""')}","","",""`);
    }
    if (data.seo?.healthScore) {
      rows.push(`SEO,HealthScore,"Overall SEO Health","","","${data.seo.healthScore.overall}/100"`);
    }
    
    // Headings
    if (data.seo?.headings?.h1) {
      data.seo.headings.h1.forEach((h: string) => rows.push(`Heading,H1,"${h.replace(/"/g, '""')}","","",""`));
    }
    if (data.seo?.headings?.h2) {
      data.seo.headings.h2.forEach((h: string) => rows.push(`Heading,H2,"${h.replace(/"/g, '""')}","","",""`));
    }
    if (data.seo?.headings?.h3) {
      data.seo.headings.h3.forEach((h: string) => rows.push(`Heading,H3,"${h.replace(/"/g, '""')}","","",""`));
    }
    
    // Content
    if (data.content?.paragraphs?.items) {
      data.content.paragraphs.items.forEach((p: string, i: number) => 
        rows.push(`Content,Paragraph,"${p.replace(/"/g, '""').substring(0, 500)}${p.length > 500 ? '...' : ''}","","Paragraph ${i + 1}",""`));
    }
    
    // Contact Information
    if (data.contact) {
      if (data.contact.phones) {
        data.contact.phones.forEach((phone: string) => rows.push(`Contact,Phone,"${phone}","","",""`));
      }
      if (data.contact.emails) {
        data.contact.emails.forEach((email: string) => rows.push(`Contact,Email,"${email}","","",""`));
      }
      if (data.contact.addresses) {
        data.contact.addresses.forEach((addr: string) => rows.push(`Contact,Address,"${addr.replace(/"/g, '""')}","","",""`));
      }
      if (data.contact.contactScore) {
        rows.push(`Contact,Score,"Contact Information Quality","","","${data.contact.contactScore}/100"`);
      }
    }

    // Links
    if (data.links) {
      const linkCategories = ['social', 'external', 'internal', 'download', 'email', 'phone'];
      linkCategories.forEach(category => {
        if (data.links[category]) {
          data.links[category].forEach((link: any) => 
            rows.push(`Link,${category.charAt(0).toUpperCase() + category.slice(1)},"${(link.text || '').replace(/"/g, '""')}","${link.href || ''}","",""`));
        }
      });
    }

    // Business Data
    if (data.business) {
      if (data.business.companyName) {
        rows.push(`Business,CompanyName,"${data.business.companyName.replace(/"/g, '""')}","","",""`);
      }
      if (data.business.services?.length > 0) {
        data.business.services.forEach((service: string) => 
          rows.push(`Business,Service,"${service.replace(/"/g, '""')}","","",""`));
      }
      if (data.business.products?.length > 0) {
        data.business.products.forEach((product: string) => 
          rows.push(`Business,Product,"${product.replace(/"/g, '""')}","","",""`));
      }
      if (data.business.pricing?.length > 0) {
        data.business.pricing.forEach((price: any) => 
          rows.push(`Business,Pricing,"${price.text?.replace(/"/g, '""') || ''}","","${price.context || ''}",""`));
      }
    }

    // Technical Data
    if (data.technical) {
      if (data.technical.technologies?.length > 0) {
        data.technical.technologies.forEach((tech: string) => 
          rows.push(`Technical,Technology,"${tech}","","",""`));
      }
      if (data.technical.frameworks?.length > 0) {
        data.technical.frameworks.forEach((framework: string) => 
          rows.push(`Technical,Framework,"${framework}","","",""`));
      }
      if (data.technical.analytics?.length > 0) {
        data.technical.analytics.forEach((analytics: string) => 
          rows.push(`Technical,Analytics,"${analytics}","","",""`));
      }
    }

    // Data Patterns
    if (data.insights?.patterns) {
      const patterns = data.insights.patterns;
      if (patterns.dates) {
        patterns.dates.forEach((date: string) => rows.push(`Pattern,Date,"${date}","","",""`));
      }
      if (patterns.times) {
        patterns.times.forEach((time: string) => rows.push(`Pattern,Time,"${time}","","",""`));
      }
      if (patterns.currencies) {
        patterns.currencies.forEach((curr: string) => rows.push(`Pattern,Currency,"${curr}","","",""`));
      }
      if (patterns.hashtags) {
        patterns.hashtags.forEach((tag: string) => rows.push(`Pattern,Hashtag,"${tag}","","",""`));
      }
      if (patterns.mentions) {
        patterns.mentions.forEach((mention: string) => rows.push(`Pattern,Mention,"${mention}","","",""`));
      }
    }
    
    // Media
    if (data.media?.images && data.media.images.count > 0) {
      rows.push(`Media,ImageStats,"Total Images: ${data.media.images.count}","","With Alt: ${data.media.images.withAltText}","${data.media.images.accessibilityScore}%"`);
    }
    
    // Summary Statistics
    if (data.summary) {
      rows.push(`Summary,TotalElements,"${data.summary.totalElements}","","",""`);
      rows.push(`Summary,ContentRichness,"${data.summary.contentRichness}","","",""`);
      rows.push(`Summary,DataQuality,"Data Quality Assessment","","","${data.summary.dataQuality}/100"`);
      rows.push(`Summary,ScrapingDifficulty,"${data.summary.scrapingDifficulty}","","",""`);
    }
    
    return rows.join('\n');
  } catch (error) {
    console.error('Error formatting CSV:', error);
    return `Type,Category,Content,URL,Additional,Score\nError,Formatting,"Failed to format CSV: ${error instanceof Error ? error.message : 'Unknown error'}","","",""`;
  }
}

function formatAsXML(data: any): string {
  try {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<webpage>\n';
    
    // Basic Page Information
    xml += `  <page>\n`;
    xml += `    <title><![CDATA[${data.page?.title || ''}]]></title>\n`;
    xml += `    <url><![CDATA[${data.page?.url || ''}]]></url>\n`;
    xml += `    <domain><![CDATA[${data.page?.domain || ''}]]></domain>\n`;
    xml += `    <protocol><![CDATA[${data.page?.protocol || ''}]]></protocol>\n`;
    xml += `  </page>\n`;
    
    // AI Insights
    if (data.aiInsights) {
      xml += `  <aiInsights>\n`;
      
      if (data.aiInsights.businessIntelligence) {
        const bi = data.aiInsights.businessIntelligence;
        xml += `    <businessIntelligence>\n`;
        xml += `      <industry><![CDATA[${bi.industry || ''}]]></industry>\n`;
        xml += `      <businessModel><![CDATA[${bi.businessModel || ''}]]></businessModel>\n`;
        xml += `      <targetAudience><![CDATA[${bi.targetAudience || ''}]]></targetAudience>\n`;
        if (bi.competitiveAdvantages?.length > 0) {
          xml += `      <competitiveAdvantages>\n`;
          bi.competitiveAdvantages.forEach((adv: string) => 
            xml += `        <advantage><![CDATA[${adv}]]></advantage>\n`);
          xml += `      </competitiveAdvantages>\n`;
        }
        xml += `    </businessIntelligence>\n`;
      }
      
      if (data.aiInsights.contentAnalysis) {
        const ca = data.aiInsights.contentAnalysis;
        xml += `    <contentAnalysis>\n`;
        xml += `      <qualityScore>${ca.qualityScore || 0}</qualityScore>\n`;
        if (ca.primaryTopics?.length > 0) {
          xml += `      <primaryTopics>\n`;
          ca.primaryTopics.forEach((topic: string) => 
            xml += `        <topic><![CDATA[${topic}]]></topic>\n`);
          xml += `      </primaryTopics>\n`;
        }
        if (ca.contentGaps?.length > 0) {
          xml += `      <contentGaps>\n`;
          ca.contentGaps.forEach((gap: string) => 
            xml += `        <gap><![CDATA[${gap}]]></gap>\n`);
          xml += `      </contentGaps>\n`;
        }
        xml += `    </contentAnalysis>\n`;
      }
      
      if (data.aiInsights.technicalInsights) {
        const ti = data.aiInsights.technicalInsights;
        xml += `    <technicalInsights>\n`;
        xml += `      <securityAssessment><![CDATA[${ti.securityAssessment || ''}]]></securityAssessment>\n`;
        xml += `      <mobileReadiness><![CDATA[${ti.mobileReadiness || ''}]]></mobileReadiness>\n`;
        if (ti.performanceIndicators?.length > 0) {
          xml += `      <performanceIndicators>\n`;
          ti.performanceIndicators.forEach((indicator: string) => 
            xml += `        <indicator><![CDATA[${indicator}]]></indicator>\n`);
          xml += `      </performanceIndicators>\n`;
        }
        xml += `    </technicalInsights>\n`;
      }
      
      if (data.aiInsights.actionableInsights?.businessOpportunities?.length > 0) {
        xml += `    <actionableInsights>\n`;
        xml += `      <businessOpportunities>\n`;
        data.aiInsights.actionableInsights.businessOpportunities.forEach((opp: string) => 
          xml += `        <opportunity><![CDATA[${opp}]]></opportunity>\n`);
        xml += `      </businessOpportunities>\n`;
        xml += `    </actionableInsights>\n`;
      }
      
      xml += `  </aiInsights>\n`;
    }
    
    // SEO Information
    if (data.seo) {
      xml += `  <seo>\n`;
      if (data.seo.meta) {
        xml += `    <meta>\n`;
        xml += `      <description><![CDATA[${data.seo.meta.description || ''}]]></description>\n`;
        xml += `      <keywords><![CDATA[${data.seo.meta.keywords || ''}]]></keywords>\n`;
        xml += `    </meta>\n`;
      }
      
      if (data.seo.healthScore) {
        xml += `    <healthScore>\n`;
        xml += `      <overall>${data.seo.healthScore.overall}</overall>\n`;
        xml += `    </healthScore>\n`;
      }
      
      if (data.seo.headings) {
        xml += `    <headings>\n`;
        if (data.seo.headings.h1 && Array.isArray(data.seo.headings.h1)) {
          data.seo.headings.h1.forEach((h: string) => xml += `      <h1><![CDATA[${h}]]></h1>\n`);
        }
        if (data.seo.headings.h2 && Array.isArray(data.seo.headings.h2)) {
          data.seo.headings.h2.forEach((h: string) => xml += `      <h2><![CDATA[${h}]]></h2>\n`);
        }
        if (data.seo.headings.h3 && Array.isArray(data.seo.headings.h3)) {
          data.seo.headings.h3.forEach((h: string) => xml += `      <h3><![CDATA[${h}]]></h3>\n`);
        }
        xml += `    </headings>\n`;
      }
      xml += `  </seo>\n`;
    }
    
    // Content
    if (data.content?.paragraphs?.items) {
      xml += `  <content>\n`;
      xml += `    <paragraphs count="${data.content.paragraphs.count || 0}">\n`;
      data.content.paragraphs.items.forEach((p: string, i: number) => 
        xml += `      <paragraph id="${i + 1}"><![CDATA[${p}]]></paragraph>\n`);
      xml += `    </paragraphs>\n`;
      if (data.content.readabilityScore) {
        xml += `    <readabilityScore>${data.content.readabilityScore}</readabilityScore>\n`;
      }
      xml += `  </content>\n`;
    }

    // Contact Information
    if (data.contact) {
      xml += `  <contact score="${data.contact.contactScore || 0}">\n`;
      if (data.contact.phones && Array.isArray(data.contact.phones)) {
        xml += `    <phones>\n`;
        data.contact.phones.forEach((phone: string) => 
          xml += `      <phone><![CDATA[${phone}]]></phone>\n`);
        xml += `    </phones>\n`;
      }
      if (data.contact.emails && Array.isArray(data.contact.emails)) {
        xml += `    <emails>\n`;
        data.contact.emails.forEach((email: string) => 
          xml += `      <email><![CDATA[${email}]]></email>\n`);
        xml += `    </emails>\n`;
      }
      if (data.contact.addresses && Array.isArray(data.contact.addresses)) {
        xml += `    <addresses>\n`;
        data.contact.addresses.forEach((addr: string) => 
          xml += `      <address><![CDATA[${addr}]]></address>\n`);
        xml += `    </addresses>\n`;
      }
      xml += `  </contact>\n`;
    }
    
    // Business Information
    if (data.business) {
      xml += `  <business>\n`;
      if (data.business.companyName) {
        xml += `    <companyName><![CDATA[${data.business.companyName}]]></companyName>\n`;
      }
      if (data.business.services?.length > 0) {
        xml += `    <services>\n`;
        data.business.services.forEach((service: string) => 
          xml += `      <service><![CDATA[${service}]]></service>\n`);
        xml += `    </services>\n`;
      }
      if (data.business.products?.length > 0) {
        xml += `    <products>\n`;
        data.business.products.forEach((product: string) => 
          xml += `      <product><![CDATA[${product}]]></product>\n`);
        xml += `    </products>\n`;
      }
      if (data.business.pricing?.length > 0) {
        xml += `    <pricing>\n`;
        data.business.pricing.forEach((price: any) => 
          xml += `      <price context="${price.context || ''}"><![CDATA[${price.text || ''}]]></price>\n`);
        xml += `    </pricing>\n`;
      }
      xml += `  </business>\n`;
    }
    
    // Technical Information
    if (data.technical) {
      xml += `  <technical>\n`;
      if (data.technical.technologies?.length > 0) {
        xml += `    <technologies>\n`;
        data.technical.technologies.forEach((tech: string) => 
          xml += `      <technology><![CDATA[${tech}]]></technology>\n`);
        xml += `    </technologies>\n`;
      }
      if (data.technical.frameworks?.length > 0) {
        xml += `    <frameworks>\n`;
        data.technical.frameworks.forEach((framework: string) => 
          xml += `      <framework><![CDATA[${framework}]]></framework>\n`);
        xml += `    </frameworks>\n`;
      }
      if (data.technical.analytics?.length > 0) {
        xml += `    <analytics>\n`;
        data.technical.analytics.forEach((analytics: string) => 
          xml += `      <service><![CDATA[${analytics}]]></service>\n`);
        xml += `    </analytics>\n`;
      }
      xml += `  </technical>\n`;
    }
    
    // Links
    xml += `  <links>\n`;
    if (data.links && typeof data.links === 'object') {
      Object.entries(data.links).forEach(([category, links]: [string, any]) => {
        if (Array.isArray(links) && links.length > 0 && category !== 'all' && category !== 'analytics') {
          xml += `    <${category}>\n`;
          links.forEach((link: any) => 
            xml += `      <link href="${link.href || ''}"><![CDATA[${link.text || ''}]]></link>\n`);
          xml += `    </${category}>\n`;
        }
      });
    }
    xml += `  </links>\n`;

    // Data Patterns
    const patterns = data.aiInsights?.patterns || data.insights?.patterns;
    if (patterns) {
      xml += `  <patterns>\n`;
      Object.entries(patterns).forEach(([category, items]: [string, any]) => {
        if (Array.isArray(items) && items.length > 0) {
          xml += `    <${category}>\n`;
          items.forEach((item: string) => 
            xml += `      <item><![CDATA[${item}]]></item>\n`);
          xml += `    </${category}>\n`;
        }
      });
      xml += `  </patterns>\n`;
    }
    
    // Media Analysis
    if (data.media?.images) {
      xml += `  <media>\n`;
      xml += `    <images count="${data.media.images.count || 0}" withAltText="${data.media.images.withAltText || 0}" accessibilityScore="${data.media.images.accessibilityScore || 0}"/>\n`;
      xml += `  </media>\n`;
    }
    
    // Summary Statistics
    if (data.summary) {
      xml += `  <summary>\n`;
      xml += `    <totalElements>${data.summary.totalElements}</totalElements>\n`;
      xml += `    <contentRichness><![CDATA[${data.summary.contentRichness}]]></contentRichness>\n`;
      xml += `    <dataQuality>${data.summary.dataQuality}</dataQuality>\n`;
      xml += `    <scrapingDifficulty><![CDATA[${data.summary.scrapingDifficulty}]]></scrapingDifficulty>\n`;
      xml += `  </summary>\n`;
    }
    
    xml += '</webpage>';
    
    return xml;
  } catch (error) {
    console.error('Error formatting XML:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<webpage>\n  <error><![CDATA[Failed to format XML: ${error instanceof Error ? error.message : 'Unknown error'}]]></error>\n</webpage>`;
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'DataShark AI-Enhanced Web Scraper',
    version: '2.0.0',
    description: 'Intelligent web scraping with AI-powered business intelligence and content analysis',
    features: [
      'AI-Enhanced Content Analysis',
      'Business Intelligence Extraction',
      'Technical Assessment',
      'Competitive Analysis',
      'SEO Health Scoring',
      'Price Tracking & Alerts',
      'Content Blueprint Analysis',
      'Advanced Pattern Recognition'
    ],
    aiCapabilities: {
      businessInsights: 'Industry analysis, business model identification, competitive advantages',
      contentAnalysis: 'Quality assessment, topic extraction, improvement suggestions',
      technicalInsights: 'Performance indicators, security assessment, mobile readiness',
      dataExtraction: 'Structured data quality, extraction difficulty, best data sources',
      actionableInsights: 'Business opportunities, data utilization, monitoring recommendations'
    },
    endpoints: {
      POST: '/api/tools/datashark - Scrape and analyze a website with AI enhancement',
    },
    usage: {
      method: 'POST',
      body: {
        url: 'string (required)',
        format: 'text | json | csv | xml (optional, default: json)',
        selectors: {
          title: 'string (optional)',
          content: 'string (optional)', 
          links: 'string (optional)',
          images: 'string (optional)',
          custom: 'object (optional)'
        }
      }
    },
    outputStructure: {
      standardData: 'Traditional scraping data (page content, links, images, etc.)',
      aiInsights: 'AI-generated business intelligence and analysis',
      seoHealth: 'Comprehensive SEO scoring and recommendations',
      priceTracking: 'Price monitoring and alert capabilities',
      contentBlueprint: 'Content strategy and quality analysis',
      metadata: 'Enhanced metadata including AI processing information'
    }
  });
}