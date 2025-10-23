import { calendarService } from '../services/schedule/calendar.service.js';

export const calendarController = {
  async list(req, res) {
    try {
      const {
        from,
        to,
        types,
        role,
        people,
        includeCancelled,
        me,
        mine,
        venue,
      } = req.query || {};
      const typeList = typeof types === 'string' ? types.split(',').filter(Boolean) : Array.isArray(types) ? types : [];
      const peopleFilter = typeof people === 'string' ? people.split(',').filter(Boolean) : Array.isArray(people) ? people : [];
      const mineId = mine === 'true' || me === 'true' ? req.user.id : undefined;
      const events = await calendarService.list({
        from,
        to,
        types: typeList,
        roleFilter: role,
        peopleFilter,
        includeCancelled: includeCancelled === 'true',
        mine: mineId,
        venue,
      });
      res.json({ items: events });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
