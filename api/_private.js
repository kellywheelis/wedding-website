// The private wall texts: the long version of each details section (addresses, schedule times, hotels, travel, registry).
// They are sent only to a signed-in guest (api/guest.js), never shipped in the page's own code. Files in api/ whose
// names start with an underscore are not endpoints and are not served. Each card is a title and a list of sections:
// { h: heading, p: [paragraphs] }. Moved here from gallery3d.js on 26 Sept 2026; still placeholder text for the owner
// to replace.
const TBC = 'To be confirmed.';
export const CARDS = {
  main: { title: 'The Main Details', sections: [
    { h: 'When', p: ['Saturday, April 24, 2027. The weekend runs from April 22 to 26. ' + TBC] },
    { h: 'Where', p: ['Villa Cetinale, Sovicille (SI), Tuscany, Italy. Full address and a map link: ' + TBC] },
    { h: 'The essentials', p: [TBC] } ] },
  schedule: { title: 'The Full Schedule', sections: [
    { h: 'Thursday, April 22', p: ['Event, time, place and dress code. ' + TBC] },
    { h: 'Friday, April 23', p: [TBC] },
    { h: 'Saturday, April 24 · the wedding', p: [TBC] },
    { h: 'Sunday, April 25', p: [TBC] },
    { h: 'Monday, April 26', p: [TBC] },
    { h: 'Dress codes', p: [TBC] } ] },
  travel: { title: 'Travel & Transportation', sections: [
    { h: 'By Pegasus (nearest airports)', p: [TBC] },
    { h: 'By centaur (trains and transit hubs)', p: [TBC] },
    { h: 'By chariot (car hire, driving and parking)', p: [TBC] },
    { h: 'Airport transfers', p: [TBC] },
    { h: 'Wedding shuttles', p: [TBC] } ] },
  stay: { title: 'Accommodations', sections: [
    { h: 'Where to stay', p: [TBC] },
    { h: 'Room blocks and group codes', p: [TBC] },
    { h: 'Booking deadlines', p: [TBC] } ] },
  logistics: { title: 'Advanced Logistics', sections: [
    { h: 'Terrain and footwear', p: [TBC] },
    { h: 'Weather in late April', p: [TBC] },
    { h: 'Outlets and voltage', p: [TBC] },
    { h: 'Currency and tipping', p: [TBC] },
    { h: 'Mobile service, wifi and eSIMs', p: [TBC] } ] },
  policies: { title: 'Guest Policies', sections: [
    { h: 'RSVP deadline', p: ['Please reply by Saturday, February 27, 2027, eight weeks before the wedding. The postcard closes after that day.'] },
    { h: 'Plus-ones', p: [TBC] },
    { h: 'Children', p: [TBC] },
    { h: 'On the day: who to call', p: [TBC] } ] },
  registry: { title: 'Registry & Extras', sections: [
    { h: 'RSVP', p: ['Pick a postcard from the rack, turn it over, and post it in the letterbox.'] },
    { h: 'Gifts', p: ['Our no-physical-gifts note. ' + TBC] },
    { h: 'A local guide', p: ['Sights, food and things to do nearby. ' + TBC] } ] }
};
