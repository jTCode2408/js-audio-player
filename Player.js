//class to load audio
export default class AudioPlayer{
    //consutrctor takes selector to generate HTML elements, & audio
    constructor(selector= '.audioPlayer', audio=[]){
        //ref where player Elm is on page
        this.playerElm = document.querySelector(selector); 
        //list of songs
        this.audio=audio;
        //song playing
        this.currentAudio=null;
        //creates HTML elements for audio player
        this.createPlayerElement();
        this.audioContext=null;
    }

    createVisualiser(){
        this.audioContext=new AudioContext();
        this.src=this.audioContext.createMediaElementSource(this.audioElm);
        const analyzer= this.audioContext.createAnalyser()
        const canvas = this.visualiserElm;
        const ctx=canvas.getContext('2d');
        this.src.connect(analyzer)
        analyzer.connect(this.audioContext.destination);
        analyzer.fftSize=128;
        const bufferLength=analyzer.frequencyBinCount;
        const dataArray=new Uint8Array(bufferLength);
        const bars=(canvas.width / bufferLength) * 2.5;
        let barHeight;
        let bar;
    

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        bar=0;
        analyzer.getByteFrequencyData(dataArray);

        ctx.fillStyle=" #000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i=0; i < bufferLength; i++){
            barHeight=dataArray[i] -75;
            const r =barHeight + (25 * (i/bufferLength));
            ctx.fillStyle=`rgb(${r}, 100, 50)`;
            ctx.fillRect(bar, canvas.height-barHeight, bars,barHeight);
            bar += bars +2;

        }

    }
    renderFrame()
}

        createPlayerElement(){
            //html5 audio element to control
            this.audioElm=document.createElement('audio');
            const playlistElm=document.createElement('div');
            playlistElm.classList.add('playlist');
            const playElm =document.createElement('button');
            playElm.classList.add('play')
            playElm.innerHTML= '<i class= "fa fa-play"></i>';
            this.visualiserElm=document.createElement('canvas');
            this.playerElm.appendChild(this.audioElm);
            this.playerElm.appendChild(playlistElm);
            this.playerElm.appendChild(this.visualiserElm);

            this.createPlaylistElm(playlistElm);
        }

        createPlaylistElm(playlistElm){
            //for each file passed into playlist, create playlist entry
            //audio files saved in audio obj, loop through and create new item, anchor tag used so that if page doesnt run js it will link to html5 audio player and play there
            this.audio.forEach(audio=> {
                const audioItem=document.createElement('a');
                //each item gets url & name props & event listener
                audioItem.href=audio.url;
                audioItem.innerHTML= `<i class= "fa fa-play"></i>    ${audio.name} - ${audio.artist}`;
                this.setEventListener(audioItem);
                playlistElm.appendChild(audioItem);

            });
        }

        setEventListener(audioItem){
                audioItem.addEventListener('click', (e)=>{
                    e.preventDefault(); //stop propogation
                    if (!this.audioContext){
                        this.createVisualiser();
                    }
                    const isCurrentAudio=audioItem.getAttribute('href')== (this.currentAudio && this.currentAudio.getAttribute('href')) //true/false if clicked is the same as playing audio(unless null)

                    if (isCurrentAudio && !this.audioElm.paused){
                    this.setPlayIcon(this.currentAudio);
                    this.audioElm.pause();
                    }else if (isCurrentAudio && this.audioElm.paused){
                        this.setPauseIcon(this.currentAudio);
                        this.audioElm.play();
                    } else{
                        if(this.currentAudio){
                            this.setPlayIcon(this.currentAudio)
                        }
                        this.currentAudio=audioItem;
                        this.setPauseIcon(this.currentAudio)
                        this.audioElm.src=this.currentAudio.getAttribute('href')
                        this.audioElm.play();
                    }

                })
            }


        setPlayIcon(elem){
            const icon=elem.querySelector('i');
            icon.classList.add('fa-play');
            icon.classList.remove('fa-pause');
           
            }

        setPauseIcon(elem){
            const icon=elem.querySelector('i');
            icon.classList.add('fa-puase');
            icon.classList.remove('fa-play');
            
            }

    }
