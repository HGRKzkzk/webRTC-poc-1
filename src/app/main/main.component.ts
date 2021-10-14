import { Component, OnInit } from '@angular/core';


enum Source {
  webcam,
  screencap
}


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  captureSource = Source

  localStream: any

  receivedOffer: any = ''
  createdAnswer: any = ''
  receivedAnswer: any = ''


  dataChannel: any;
  textToSend: any;

  mediaStreamConstraints = {
    video: true,
    audio: true
  };

  connection: any;


  constructor() {
    this.connection = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]})


  }

  ngOnInit(): void {
    console.log(this.connection)

    this.connection.ondatachannel = (event: any) => {
      this.dataChannel = event.channel
      this.dataChannel.onmessage = (event: any) => alert(event.data)
    }

    this.connection.onconnectionstatechange = (event: any) => console.log(this.connection.connectionState); // console.log('onconnectionstatechange', connection.connectionState)
    this.connection.oniceconnectionstatechange = (event: any) => console.log(this.connection.iceConnectionState)  // console.log('oniceconnectionstatechange', connection.iceConnectionState)

    this.connection.onicecandidate = (event: any) => {
      // window.alert(event)
      // console.log('onicecandidate', event)
      if (!event.candidate) {
        this.receivedOffer = this.connection.localDescription;

      }
    }

  }

  async getMedia(captureSource: any) {

    console.log(captureSource)

    let stream = null;
    // mediastream openen

    switch (captureSource) {
      case 0: {
        console.log('webcam')

        try {
          this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints);
          console.log(this.localStream)

          // mediastreams toevoegen aan peer connection
          this.localStream.getTracks().forEach((track: any) => {
            this.connection.addTrack(track)
          });
        } catch (err) {
          console.log(err)
        }
      }
        break;
      case 1: {
        console.log('screencap')

        try {
          // @ts-ignore
          this.localStream = await navigator.mediaDevices.getDisplayMedia(this.mediaStreamConstraints);
          console.log(this.localStream)

          // mediastreams toevoegen aan peer connection
          this.localStream.getTracks().forEach((track: any) => {
            this.connection.addTrack(track)
          });
        } catch (err) {
          console.log(err)
        }



      }
        break;
      default: {
        console.log('???')
      }
    }
  }


  async closeMedia() {

    // mediastreams sluiten
    try {
      this.localStream.getTracks().forEach((track: any) => {
        track.stop();
        // en uit peer connection verwijderen
        this.localStream.removeTrack(track);
      });

    } catch (err) {
      console.log(err)
    }


  }

  async terminateConnection() {
    this.connection.close();
    this.connection = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]})
  }

  async initDataChannel() {
    this.dataChannel = await this.connection.createDataChannel('data')
    console.log(this.dataChannel)
  }

  async createOfferAndSetLocalDescription() {
    await this.initDataChannel()
    const offer = await this.connection.createOffer()
    await this.connection.setLocalDescription(offer)
    console.log(this.connection)
  }

  async acceptRemoteOffer() {
    console.log(this.receivedOffer)
    await this.connection.setRemoteDescription(JSON.parse(this.receivedOffer))
    console.log(this.connection)
  }

  async createAnswer() {
    this.connection.onicecandidate = (event: any) => {
      console.log('onicecandidate', event)
      if (!event.candidate) {

      }
    }
    const answer = await this.connection.createAnswer()
    await this.connection.setLocalDescription(answer)
  }

  async acceptRemoteAnswer() {
    await this.connection.setRemoteDescription(JSON.parse(this.receivedAnswer))

  }

  sendText() {
    this.dataChannel.send(this.textToSend)
  }

  logConnectionStatus() {
    console.log(this.connection)
  }


}
