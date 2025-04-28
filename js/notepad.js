document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('#notepad-body textarea');
    const rightArrow = document.getElementsByClassName('right')[0];
    const leftArrow = document.getElementsByClassName('left')[0];
    const socket = io();
    leftArrow.style.display = 'none'
    const notepadBehind = document.getElementById('notepad-behind')
    notepadBehind.style.display = `none`;
    
    let currentNoteIndex = 0;
    let notes = [{ content: '' }]; 

    function displayCurrentNote() {
        textarea.value = notes[currentNoteIndex].content;
        socket.emit('notepad_text', textarea.value)
    }

    function createNewNote() {
        notes.push({ content: '' });
        currentNoteIndex = notes.length - 1;
        displayCurrentNote();
    }

    rightArrow.addEventListener('click', () => {
        notes[currentNoteIndex].content = textarea.value;

        if (currentNoteIndex < notes.length - 1) {
            currentNoteIndex++;
        } else {
            createNewNote();
        }

        if (currentNoteIndex > 0){
            leftArrow.style.display = 'grid'
            notepadBehind.style.display = `block`;
        }
        displayCurrentNote();
    });

    leftArrow.addEventListener('click', () => {
        notes[currentNoteIndex].content = textarea.value;
        if (currentNoteIndex > 0) {
            currentNoteIndex = currentNoteIndex - 1;
            displayCurrentNote();
        }

        if (currentNoteIndex === 0){
            leftArrow.style.display = 'none'
            notepadBehind.style.display = `none`;
        }

    });

    textarea.addEventListener('input', () => {
        notes[currentNoteIndex].content = textarea.value;
        socket.emit('notepad_text', textarea.value);
    });

    document.addEventListener('keydown', (e) => {
        socket.emit('keydown', e.key);
    });

});