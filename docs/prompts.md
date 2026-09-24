## LLM Prompts

This file records the prompts we gave to AI coding assistents and/or other LLMs for help while coding this project. It is orginaized by group member, each bullot depicts the initial prompt with the subbullets depicting the revision prompts./resu

## Peter (using Claude Code CLI)
- " What is the the convention in THREE.js for file/dir organization. I am building out a skeliton of this project, I want to have the main area be the puzzleArea and have the camera facing it. I also want to have objects such as puzzle piece, where should I store them in the skeliton" (prompted after putting together the general file structure and using code template from the examples in Canvas)
    - Continued the session by cleaning up artifacts and ensuring the code scaffholding looked the way I wanted it to
- " How do I set the ocotogon to be x by x pixel" (after I build the octogon I could not find any documentation on matching screen pixel size)
    - Continued the session by selecting one of the many option routs it suggested (passing the camera into PuzzleArea and computing the radius there)
    - Had claude make a duplicate octogon to make a makeshift border around the first.
- " Add jdocs at the start of the other files just like @src/objects/PuzzleArea.js, in @src/objects/PuzzlePiece.js do not put anything"  (used claude to update my documentation following the format I had already written. It didn't do it perfectly but I revised it myself)
- A series of mini prompts to make the index.html front page look the way I wanted and properly wire in the already existing js files
- "In @src/main.js add a function that takes the puzzlePiece piece as input and changes the hex color by a uniform amount (ie the color was a shade of blue and it gets changed to another simular shade of blue). Name this function highlightColor."
    - Had claude update the solution to make all pieces black
## Jackson (using Claude Code CLI)
- "I want the puzzle pieces to spawn in random location but still keep the functionality of snapping into place"
    - Generated code was way overengineered so I asked to simplify the logic by replacing the code with a basic for loop that would iterate over each piece and generate random coordinates for it. If those coordinates overlapped with another piece or the puzzle area then the coordinates would be redrawn.
- "Update the @README.md file to provide an overview of the project and how to play. Include instrucions for how to run it using npm"

## Laura