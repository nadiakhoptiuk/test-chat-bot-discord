import { ColorResolvable, EmbedBuilder } from "discord.js";

export const feedbackEmbed = (points: number, feedback: string) => {
  return new EmbedBuilder()
    .setColor(getColorForRating(points) as ColorResolvable)
    .setTitle('Thank you for your feedback! 🙏')
    .addFields(
      { name: 'Rating', value: `${points}/5 ⭐`, inline: false },
      { name: 'Your feedback', value: feedback, inline: false }
    )
    .setTimestamp();
};

// Helper function to get color based on rating
function getColorForRating(rating: number): string {
  switch(rating) {
    case 1: return 'Red'; 
    case 2: return 'Orange'; 
    case 3: return 'Yellow'; 
    case 4: return 'Blue'; 
    case 5: return 'Green'; 
    default: return 'Grey'; 
  }
}