'use strict';

const EMOJIS = require('./emojis');
const TOO_GENERIC_LABELS = ['animal', 'mammal', 'pet', 'food', 'dish'];

class MessageCreator {
    
    static createResponseMessage(imageLabels) {

      console.log('>> Creating response from labels: ', JSON.stringify(imageLabels));
      return new Promise((resolve, reject) => {
          
        if (imageLabels.length < 1) {
            console.log('Not enough labels');
            return resolve('I don\'t know... It\'s too hard for me 😞😞')
        }

        const names = imageLabels
            .map(label => label.Name)
            .map(label => label.toLowerCase())
            
        
        const isAnimal = names
            .filter(label => label === 'animal')
            .length == 1;

        const labels = names
            .filter(label => TOO_GENERIC_LABELS.indexOf(label) === -1)
            .filter(label => label.indexOf('life') == -1)
        console.log('Filtered labels: ' + labels);
            
        const emoji = labels.map(label => EMOJIS[label] || '')
            .filter(emoji => emoji !== '')
            .join('');
        console.log('Found emoji: ' + emoji);

        const msg = isAnimal
            ? MessageCreator.animalResponse(labels, emoji)
            : MessageCreator.nonAnimalResponse(labels);

        console.log('Formatted message:', msg);
        return resolve(msg);
    });
  }
  
    static animalResponse(labels, emoji) {
        
        const additionalLabel = labels.length > 1 ? ('/' + labels[1]) : '';
        return Math.random() >= 0.5
            ? `I know! It is a ${labels[0]}${additionalLabel}, am I right? ${emoji}${emoji}`
            : `It looks like a ${labels[0]}${additionalLabel} to me. What do you think? ${emoji}${emoji}`
    }

    static nonAnimalResponse(labels) {
        
        const additionalLabel = labels.length > 1 ? ('/' + labels[1]) : '';

        return Math.random() >= 0.5
            ? `hmm.. I don\'t think it is an animal.. isn't this just a ${labels[0]}${additionalLabel}? 🤔`
            : `This doesn\'t look like an animal to me 🤔 Is this some ${labels[0]}${additionalLabel}?`
    }

}

module.exports = MessageCreator;