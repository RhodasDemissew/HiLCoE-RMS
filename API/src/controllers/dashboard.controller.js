import { dashboardService } from '../services/dashboard.service.js';
import { messagingService } from '../services/messaging.service.js';
import { calendarService } from '../services/schedule/calendar.service.js';

export const dashboardController = {
  async getStatistics(req, res) {
    try {
      const statistics = await dashboardService.getStatistics();
      res.json(statistics);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getSubmissionsByStage(req, res) {
    try {
      const submissionsByStage = await dashboardService.getSubmissionsByStage();
      res.json(submissionsByStage);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getRecentMessages(req, res) {
    try {
      const conversations = await messagingService.listConversations(req.user.id);
      const recentMessages = [];
      
      // Debug: Log the conversations to see what we're getting
      console.log('Dashboard - Conversations found:', conversations.length);
      
      // Get the most recent message from each conversation
      for (const conversation of conversations) {
        if (conversation.last_message && conversation.last_message.created_at) {
          const timeAgo = getTimeAgo(conversation.last_message.created_at);
          
          // Find the other participant (not the current user)
          const currentUserId = String(req.user.id);
          const otherParticipant = conversation.participants.find(
            participant => String(participant.user?.id || participant.user) !== currentUserId
          );
          
          // Use the other participant's name and role, or fallback to sender if not found
          const displayName = otherParticipant?.user?.name || conversation.last_message.sender?.name || 'Unknown';
          const displayRole = otherParticipant?.role || conversation.last_message.sender?.role || 'User';
          
          recentMessages.push({
            id: conversation.last_message.id || Math.random(),
            author: displayName,
            role: displayRole,
            ago: timeAgo,
            body: conversation.last_message.preview || 'No preview available',
            conversationId: conversation.id,
            created_at: conversation.last_message.created_at
          });
        }
      }
      
      // Sort by most recent and limit to 4 messages
      recentMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const limitedMessages = recentMessages.slice(0, 4);
      
      // Debug: Log the final messages
      console.log('Dashboard - Recent messages:', limitedMessages.length);
      
      res.json(limitedMessages);
    } catch (err) {
      console.error('Dashboard - Error fetching recent messages:', err);
      res.status(400).json({ error: err.message });
    }
  },

  async getUpcomingEvents(req, res) {
    try {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      
      console.log('Dashboard - Fetching events from:', now.toISOString(), 'to:', thirtyDaysFromNow.toISOString());
      
      const events = await calendarService.list({
        from: now.toISOString(),
        to: thirtyDaysFromNow.toISOString(),
        types: ['defense', 'synopsis'],
        includeCancelled: false
      });
      
      console.log('Dashboard - Raw events found:', events.length);
      console.log('Dashboard - Events:', events);
      
      // Format events for dashboard display
      const formattedEvents = events.slice(0, 5).map(event => {
        let dateStr = 'Date TBD';
        try {
          if (event.start_at) {
            const eventDate = new Date(event.start_at);
            if (!isNaN(eventDate.getTime())) {
              dateStr = eventDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              });
            }
          }
        } catch (error) {
          console.warn('Date formatting error:', error);
        }
        
        return {
          id: event.id,
          title: event.title || event.type || 'Event',
          date: dateStr,
          owner: event.candidate?.name || event.supervisor?.name || 'Unknown',
          type: event.type,
          start_at: event.start_at
        };
      });
      
      console.log('Dashboard - Formatted events:', formattedEvents);
      res.json(formattedEvents);
    } catch (err) {
      console.error('Dashboard - Error fetching upcoming events:', err);
      res.status(400).json({ error: err.message });
    }
  }
};

function getTimeAgo(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}
