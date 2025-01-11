/*++
 *
 * Abstract:
 *
 *    Niko Oneshot.
 *
 * File description:
 *
 *    Noik oneshor.
 *
--*/

function
rollOneShot(

    )
/*++
 *
 * Description:
 *
 *    Get a good LSP lmao this is way superior
 *
 * Arguments:
 *
 *    I actually need mental help. what the fuck is wrong with me
 *
--*/
{
    const MIN = 1;  // first image index is 1 instead of zero.
    const MAX = 14; // there's only 14 images so far.
                    // this is good code i swear

    // #define NIKOS_PATH
    const NIKOS_PATH = "./src/static/img/nikos/";
    const EXTENSION  = ".png";

    const randomNum = Math.floor(Math.random() * MAX) + MIN;

    const nikoElement = document.getElementById("noikoneshor");

    console.warn("niko");
    nikoElement.src = `${NIKOS_PATH}${randomNum}${EXTENSION}`;
}

rollOneShot();

