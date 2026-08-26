import { prisma } from '../../config/database';

export class DashboardService {
  async getDashboardStats() {
    const [
      pendingQueries,
      activeBookings,
      pendingFeedbacks,
      liveTattoos,
      queriesBySourceRaw,
      queriesByStatusRaw,
      feedbacksByRatingRaw,
      feedbackRatingStats,
      stylesRaw
    ] = await Promise.all([
      // 1. Top Level KPIs
      prisma.query.count({ where: { status: 'PENDING' } }),
      prisma.query.count({ where: { status: { in: ['IN_PROGRESS', 'BOOKED'] } } }),
      prisma.feedback.count({ where: { status: 'PENDING' } }),
      prisma.content.count({ where: { status: 'PUBLISHED' } }),
      
      // 2. Queries By Source (Lead Generation Sources)
      prisma.query.groupBy({
        by: ['source'],
        _count: { id: true }
      }),

      // 3. Queries By Status (Lead Conversion Funnel)
      prisma.query.groupBy({
        by: ['status'],
        _count: { id: true }
      }),

      // 4. Feedbacks By Rating (Customer Satisfaction)
      prisma.feedback.groupBy({
        by: ['rating'],
        _count: { id: true },
        where: { status: 'APPROVED' }
      }),

      // Average Rating
      prisma.feedback.aggregate({
        _avg: { rating: true },
        where: { status: 'APPROVED' }
      }),

      // 5. Popular Styles
      prisma.style.findMany({
        include: {
          _count: { select: { queries: true, contents: true } },
          translations: { select: { name: true, language_code: true } }
        }
      })
    ]);

    // Format queries by source
    const queriesBySource = queriesBySourceRaw.map(item => ({
      source: item.source,
      count: item._count.id
    }));

    // Format queries by status
    const queriesByStatus = queriesByStatusRaw.map(item => ({
      status: item.status,
      count: item._count.id
    }));

    // Format feedbacks by rating
    const feedbacksByRating = feedbacksByRatingRaw.map(item => ({
      rating: item.rating,
      count: item._count.id
    }));

    // Format and sort popular styles (ranking by number of queries + contents)
    const popularStyles = stylesRaw
      .map(style => {
        const enTranslation = style.translations.find(t => t.language_code === 'en');
        const name = enTranslation ? enTranslation.name : style.slug;
        const totalInterest = style._count.queries + style._count.contents;
        return {
          id: style.id,
          name,
          queryCount: style._count.queries,
          contentCount: style._count.contents,
          totalInterest
        };
      })
      .sort((a, b) => b.totalInterest - a.totalInterest)
      .slice(0, 5); // Top 5 styles

    return {
      kpis: {
        pendingQueries,
        activeBookings,
        pendingFeedbacks,
        liveTattoos,
        averageRating: feedbackRatingStats._avg.rating || 0
      },
      charts: {
        queriesBySource,
        queriesByStatus,
        feedbacksByRating,
        popularStyles
      }
    };
  }
}

export const dashboardService = new DashboardService();
