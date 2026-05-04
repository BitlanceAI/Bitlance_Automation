import { supabase } from '../lib/supabase';

class BlogService {
    // Save generated article to Supabase
    async saveArticle(articleData) {
        try {
            console.log('BlogService: Starting to save article to Supabase...', articleData);

            const article = {
                topic: articleData.topic,
                seo_title: articleData.seoTitle,
                content: articleData.content,
                image_url: articleData.imageUrl || null,
                keywords: articleData.keywords,
                language: articleData.language,
                style: articleData.style,
                length: articleData.length,
                audience: articleData.audience,
                user_id: articleData.userId || 'anonymous'
            };

            const { data, error } = await supabase
                .from('articles')
                .insert([article])
                .select()
                .single();

            if (error) {
                console.error('BlogService ERROR saving article:', error);
                throw error;
            }

            console.log('BlogService: Article saved successfully to Supabase!', data);
            return { success: true, id: data.id, article: data };
        } catch (error) {
            console.error('BlogService ERROR:', error);
            throw error;
        }
    }

    // Get all articles (or filter by userId)
    async getArticles(userId = null, limit = 50) {
        try {
            console.log('BlogService: Fetching articles from Supabase...');

            let query = supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('BlogService ERROR fetching articles:', error);
                throw error;
            }

            // Transform snake_case to camelCase for frontend
            const articles = (data || []).map(article => ({
                id: article.id,
                topic: article.topic,
                seoTitle: article.seo_title,
                content: article.content,
                imageUrl: article.image_url,
                keywords: article.keywords,
                language: article.language,
                style: article.style,
                length: article.length,
                audience: article.audience,
                userId: article.user_id,
                createdAt: article.created_at,
                updatedAt: article.updated_at
            }));

            console.log('BlogService: Fetched', articles.length, 'articles');
            return articles;
        } catch (error) {
            console.error('BlogService ERROR:', error);
            return [];
        }
    }

    // Get single article by ID
    async getArticleById(articleId) {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching article:', error);
            return null;
        }
    }

    // Delete article
    async deleteArticle(articleId) {
        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error deleting article:', error);
            throw error;
        }
    }

    // Update article
    async updateArticle(articleId, updates) {
        try {
            const { data, error } = await supabase
                .from('articles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', articleId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, article: data };
        } catch (error) {
            console.error('Error updating article:', error);
            throw error;
        }
    }
}

export default new BlogService();
