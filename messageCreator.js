'use strict';

const EMOJIS = require('./emojis');
const TOO_GENERIC_LABELS = ['animal', 'mammal'];

class MessageCreator {
    
    static createResponseMessage(imageLabels) {

      console.log('>> Creating response from labels: ', JSON.stringify(imageLabels));
      return new Promise((resolve, reject) => {
          
        if (imageLabels.length < 2) {
            console.log('Not enough labels');
            return reject('Not enough labels');
        }
        
        const names = imageLabels.map(label => label.Name);
        
        const isAnimal = names
            .filter(label => label === 'Animal')
            .length == 1;

        const animalLabels = names
            .map(label => label.toLowerCase())
            .filter(label => TOO_GENERIC_LABELS.indexOf(label) === -1)
            .filter(label => label.indexOf('life') == -1)
            
        const emoji = animalLabels.map(label => EMOJIS[label] || '')
            .filter(emoji => emoji !== '')
            .join('');
        console.log('Found emoji: ' + emoji);
        
        const additionalLabel = animalLabels.length > 0 ? ('/' + animalLabels[1]) : '';
        
        const msg = isAnimal
            ? `I know! It is a ${animalLabels[0]}${additionalLabel}, am I right? ${emoji}${emoji}`
            : `hmm.. I don\'t think it is an animal.. isn't this just a ${names[0]}/${names[1]}? 🤔`;

        console.log('Formatted message:', msg);
        return resolve(msg);
    });
  }
}

module.exports = MessageCreator;