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
        this.audioContext = new AudioContext();
        this.src = this.audioContext.createMediaElementSource(this.audioElm);
        const analyzer= this.audioContext.createAnalyser();
        const canvas = this.progressViz;
        const audioCtx=canvas.getContext('2d');
        this.src.connect(analyzer);
        analyzer.connect(this.audioContext.destination);
        analyzer.fftSize=128;
        const bufferLength=analyzer.frequencyBinCount;
        const dataArray= new Uint8Array(bufferLength);
        const barsWidth=(canvas.width / bufferLength) * 2.5;
        let barHeight;
        let bar;
    

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        bar=0;
        analyzer.getByteFrequencyData(dataArray);

        audioCtx.fillStyle="#000";
        audioCtx.fillRect(0, 0, canvas.width, canvas.height); 

        for (let i=0; i < bufferLength; i++){
            barHeight=dataArray[i] -90; //bar height
            const color =barHeight + (25 * (i/bufferLength)); 
            audioCtx.fillStyle=`rgb(${color}, 0,200, 105)`;
            audioCtx.fillRect(bar, canvas.height-barHeight, barsWidth,barHeight); 
            bar += barsWidth +2; //padding for bars

        }

    }
    renderFrame();
}

        createPlayerElement(){
            //html5 audio element to control
            this.audioElm=document.createElement('audio');
            this.audioElm.addEventListener('ended', this.playNext.bind(this));
            this.audioElm.ontimeupdate=this.updateTime.bind(this);
            
            const playerCont=document.createElement('div');
            playerCont.classList.add('container');
            
            this.playlistElm=document.createElement('div');
            this.playlistElm.classList.add('playlist');
            
            const playButton =document.createElement('button');
            playButton.classList.add('play');
            playButton.innerHTML= '<i class="fa fa-play"></i>';
            
            this.progressViz=document.createElement('canvas');

            const progressBarDiv=document.createElement('div');
            progressBarDiv.classList.add('progressBar');

            playerCont.appendChild(this.audioElm);
            playerCont.appendChild(this.playlistElm);
            playerCont.appendChild(this.progressViz);
           
            this.playerElm.appendChild(playerCont);
            this.playerElm.appendChild(progressBarDiv); 
               
            
            this.createPlaylistElm(this.playlistElm);
            this.createProgressBarElm(progressBarDiv);
        }

            createProgressBarElm(progressBarDiv){
                const progressCont =document.createElement('div');
                progressCont.classList.add('container');

                const backBtn=document.createElement('button');
                const nextBtn=document.createElement('button');

                nextBtn.innerHTML= `>>`;
                backBtn.innerHTML=`<<`;
                backBtn.addEventListener('click', this.playPrev.bind(this));
                nextBtn.addEventListener('click', this.playNext.bind(this));
                
            
                this.progressBarCanvas=document.createElement('canvas');
                this.progressBarCanvas.addEventListener('click', (e)=>{
                    const progressBarWidth=parseInt(window.getComputedStyle(this.progressBarCanvas).width);

                    const amountComplete=((e.clientX - this.progressBarCanvas.getBoundingClientRect().left) / progressBarWidth);
                    this.audioElm.currentTime=(this.audioElm.duration || 0) * amountComplete;
                });

                this.timer=document.createElement('div');
                this.timer.classList.add('timer');
                progressCont.appendChild(this.timer);
                progressCont.appendChild(backBtn);
                
                progressCont.appendChild(this.progressBarCanvas);
                progressCont.appendChild(nextBtn);
                
                progressBarDiv.appendChild(progressCont);
                
            }
        
            updateCurrentAudio(nextAudio){ 
                if(!this.audioContext){
                    this.createVisualiser();
                }
                this.setPlayIcon(this.currentAudio);
                this.currentAudio=nextAudio;
                this.setPauseIcon(this.currentAudio);
                this.audioElm.src=this.currentAudio.getAttribute('href');
                this.audioElm.play();
            }

            playNext(){
                const index=this.songs.findIndex(
                    audioItem=>audioItem.getAttribute('href')=== this.currentAudio.getAttribute('href')
                    );
                    const nextAudio = index >= this.songs.length -1 ? this.songs[0] : this.songs[index+1];
                    this.updateCurrentAudio(nextAudio);
                }
                playPrev(){
                    const index = this.songs.findIndex(
                        audioItem=>audioItem.getAttribute('href')=== this.currentAudio.getAttribute('href')
                        );
                        const nextAudio = index <= 0 ? this.songs[this.songs.length -1] : this.songs[index-1];
                        this.updateCurrentAudio(nextAudio)
                }

                updateTime(){

                    const {currentTime, duration}= this.audioElm;
                    this.updateProgressBar();
                }

                updateProgressBar(){
                const progressSize=(current, overall, width)=>(current/overall) * width;
                const {currentTime, duration} =this.audioElm;
                const progressCtx=this.progressBarCanvas.getContext('2d');
                progressCtx.fillStyle= '#000';
                progressCtx.fillRect(0,0, this.progressBarCanvas.width, this.progressBarCanvas.height);

                progressCtx.fillStyle='#a6E1fa';
                progressCtx.fillRect(0,0, progressSize(currentTime, duration, this.progressBarCanvas.width), this.progressBarCanvas.height)
                }


        createPlaylistElm(playlistElm){
            this.songs= this.audio.map(audio=>{
                const audioItem=document.createElement('a');
                //each item gets url & name props & event listener
                audioItem.href=audio.url;
                audioItem.innerHTML= `<i class="fa fa-play"></i>   ${audio.name} (${audio.artist})`;
                this.setEventListener(audioItem);
                playlistElm.appendChild(audioItem);
                return audioItem

            });

            this.currentAudio=this.songs[0];
        }

        setEventListener(audioItem){
                audioItem.addEventListener('click', (e)=>{
                    e.preventDefault(); //stop propogation
                    if (!this.audioContext){
                        this.createVisualiser();
                    }
                    const isCurrentAudio = audioItem.getAttribute('href') == (this.currentAudio && this.currentAudio.getAttribute('href')); //true/false if clicked is the same as playing audio(unless null)

                    if (isCurrentAudio && !this.audioElm.paused){
                 
                    this.audioElm.pause();
                    }else if (isCurrentAudio && this.audioElm.paused){
                       
                        this.audioElm.play();
                    } else{
                    
                        this.currentAudio=audioItem;
                     
                        this.audioElm.src=this.currentAudio.getAttribute('href');
                        this.audioElm.play();
                    }

                })
            }
   
    }
