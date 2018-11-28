'use strict';

const EMOJIS = require('./emojis');
const TOO_GENERIC_LABELS = ['animal', 'mammal', 'pet'];

class MessageCreator {
    
    static createResponseMessage(imageLabels) {

      console.log('>> Creating response from labels: ', JSON.stringify(imageLabels));
      return new Promise((resolve, reject) => {
          
        if (imageLabels.length < 2) {
            console.log('Not enough labels');
            return resolve('I don\'t know... It\'s too hard for me 😞😞')
        }

        const names = imageLabels.map(label => label.Name)
            .map(label => label.toLowerCase());
        
        const isAnimal = names
            .filter(label => label === 'animal')
            .length == 1;

        const animalLabels = names
            .filter(label => TOO_GENERIC_LABELS.indexOf(label) === -1)
            .filter(label => label.indexOf('life') == -1)
        console.log('Filtered labels: ' + animalLabels);
            
        const emoji = animalLabels.map(label => EMOJIS[label] || '')
            .filter(emoji => emoji !== '')
            .join('');
        console.log('Found emoji: ' + emoji);
        
        const additionalLabel = animalLabels.length > 1 ? ('/' + animalLabels[1]) : '';
        
        const msg = isAnimal
            ? `I know! It is a ${animalLabels[0]}${additionalLabel}, am I right? ${emoji}${emoji}`
            : `hmm.. I don\'t think it is an animal.. isn't this just a ${names[0]}/${names[1]}? 🤔`;

        console.log('Formatted message:', msg);
        return resolve(msg);
    });
  }
}

module.exports = MessageCreator;