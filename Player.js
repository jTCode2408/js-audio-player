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
        const canvas = this.visualiserElm;
        const ctx=canvas.getContext('2d');
        this.src.connect(analyzer);
        analyzer.connect(this.audioContext.destination);
        analyzer.fftSize=128;
        const bufferLength=analyzer.frequencyBinCount;
        const dataArray= new Uint8Array(bufferLength);
        const barW=(canvas.width / bufferLength) * 2.5;
        let barHeight;
        let bar;
    

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        bar=0;
        analyzer.getByteFrequencyData(dataArray);

        ctx.fillStyle=" #000";
        ctx.fillRect(0, 0, canvas.width, canvas.height); //start from corner, fill entire canvas color #000

        for (let i=0; i < bufferLength; i++){
            barHeight=dataArray[i] -75; //bar height, without -75 will go to top of pagfe
            const r =barHeight + (25 * (i/bufferLength)); // r is for fill colors
            ctx.fillStyle=`rgb(${r}, 100, 50)`;
            ctx.fillRect(bar, canvas.height-barHeight, barW,barHeight); //generate bar for canvas, in loop for each
            bar += barW +2; //padding for bars

        }

    }
    renderFrame();
}

        createPlayerElement(){
            //html5 audio element to control
            this.audioElm=document.createElement('audio');
            this.audioElm.addEventListener('ended', this.playNext.bind(this));
            this.audioElm.ontimeupdate=this.updateTime.bind(this);
            
            const containerElm=document.createElement('div');
            containerElm.classList.add('container');
            
            this.playlistElm=document.createElement('div');
            this.playlistElm.classList.add('playlist');
            
            const playElm =document.createElement('button');
            playElm.classList.add('play');
            playElm.innerHTML= '<i class= "fa fa-play"></i>';
            
            this.visualiserElm=document.createElement('canvas');

            const progressBarElm=document.createElement('div');
            progressBarElm.classList.add('progressBar');

            containerElm.appendChild(this.audioElm);
            containerElm.appendChild(this.playlistElm);
            containerElm.appendChild(this.visualiserElm);

            this.playerElm.appendChild(containerElm);
            this.playerElm.appendChild(progressBarElm);
            
            this.createPlaylistElm(this.playlistElm);
            this.createProgressBarElm(progressBarElm);
        }

            createProgressBarElm(progressBarElm){
                const container =document.createElement('div');
                container.classList.add('container');

                const previousBtn=document.createElement('button');
                const nextBtn=document.createElement('button');

                nextBtn.innerHTML= `<i class="fas fa-forward"></i>`;
                previousBtn.innerHTML=`<i class="fas fa-backward"> </i>`;
                previousBtn.addEventListener('click', this.playPrev.bind(this));
                nextBtn.addEventListener('click', this.playNext.bind(this));
                
            
                this.progressBar=document.createElement('canvas');
                this.progressBar.addEventListener('click', (e)=>{
                    const progressBarWidth=parseInt(window.getComputedStyle(this.progressBar).width);

                    const amountComplete=((e.clientX - this.progressBar.getBoundingClientRect().left) / progressBarWidth);
                    this.audioElm.currentTime=(this.audioElm.duration || 0) * amountComplete;
                });

                this.timer=document.createElement('div');
                this.timer.classList.add('timer');

                container.appendChild(previousBtn);
                container.appendChild(this.timer);
                container.appendChild(nextBtn);

                progressBarElm.appendChild(container);
                progressBarElm.appendChild(this.progressBar);
            }
        
            updateCurrentAudio(nextAudio){ //updates curent audio playing
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
                    const parseTime=time=>{
                        //take time as seconds and return as min/sec
                        const seconds=String(Math.floor(time % 60) || 0).padStart('2', '0');
                        const minutes=String(Math.floor(time/60)   || 0).padStart('2', '0');

                        return `${minutes}: ${seconds}`;
                    };

                    const {currentTime, duration}= this.audioElm;
                    this.timer.innerHTML =`${parseTime(currentTime)} / ${parseTime(duration)}`;

                    this.updateProgressBar();
                }

                updateProgressBar(){
                const progressSize=(current, overall, width)=>(current/overall) * width;
                const {currentTime, duration} =this.audioElm;
                const progressCtx=this.progressBar.getContext('2d');
                progressCtx.fillStyle= '#000';
                progressCtx.fillRect(0,0, this.progressBar.width, this.progressBar.height);

                progressCtx.fillStyle='#65ac6b';
                progressCtx.fillRect(0,0, progressSize(currentTime, duration, this.progressBar.width), this.progressBar.height)
                }


        createPlaylistElm(playlistElm){
            //for each file passed into playlist, create playlist entry
            //audio files saved in audio obj, loop through and create new item, anchor tag used so that if page doesnt run js it will link to html5 audio player and play there
         //BUG HERE. AUDIO ELEMNTS< RENAME TO BE NEW ARR. LOOK AT 148 IN SRC CODE. Change instances of audioElms where it should be audioElements new arr//
            this.songs= this.audio.map(audio=>{
                const audioItem=document.createElement('a');
                //each item gets url & name props & event listener
                audioItem.href=audio.url;
                audioItem.innerHTML= `<i class= "fa fa-play"></i>    ${audio.name} - ${audio.artist}`;
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
                        this.audioElm.src=this.currentAudio.getAttribute('href');
                        this.audioElm.play();
                    }

                })
            }


            
        setPauseIcon(elem){
            const icon=elem.querySelector('i');
            icon.classList.add('fa-puase');
            icon.classList.remove('fa-play');
            }

        setPlayIcon(elem){
            const icon=elem.querySelector('i');
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
           
           
            }
    }
