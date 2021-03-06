// @flow
'use strict'

import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import audioActions from '../../reducer/audio/audioAction'
import { connect } from 'react-redux'
import {
  TouchableHighlight,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native'
import {
  Container,
  Content,
  View,
  Text,
  Left,
  Right,
  Button,
  List,
  ListItem,
  Footer
} from 'native-base'
import firebase from 'firebase'
import styles from './styles'
import {
  Player,
} from 'react-native-audio-toolkit'

const { width : screenWidth, height: screenHeight } = Dimensions.get('window')
console.log('screenHeight', screenHeight);
console.log('screenWidth', screenWidth);

let buttons = {
  'playingOnAudioBar': require('../../assets/img/audioElement/play.png'),
  'playing': require('../../assets/img/audioElement/playing2.png'),
  'pause': require('../../assets/img/audioElement/pause.png'),
  'expand': require('../../assets/img/knowledgeCapsule/expend.png'),
  'playable': require('../../assets/img/audioElement/playing1.png')
}

const mapStateToProps = (state) => {
  return {
    playState: state.audio.playState,
    capsules: state.audio.capsules,
    audioName: state.audio.playingAudioInfo.name,
    currentTimeFormatted: state.audio.playingAudioInfo.currentTime.formatted,
    currentTimeSec: state.audio.playingAudioInfo.currentTime.sec,
    audioLength: state.audio.playingAudioInfo.length,
    audioUrl: state.audio.playingAudioInfo.url,
    isCpAudioLoaded: state.audio.isCpAudioLoaded,
    playingAudioPos: {
      i: state.audio.playingAudioInfo.pos.i,
      j: state.audio.playingAudioInfo.pos.j
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(audioActions, dispatch)
  }
}

class KnowledgeCapsule extends Component {

  interval = null

  player = null

  state = {
    popoutAudioBarHeight: new Animated.Value(screenHeight),
    offsetY: 0,
    audioBarActive: false,
    lastKey: null, // firebase last key
  }

  componentDidMount () {
    const { actions } = this.props

    // get data from firebase
    let capsuleRef = firebase.database().ref('capsules').orderByKey().limitToLast(2)
    capsuleRef
      .on('child_added', (snapshot, prevChildKey) => {

        let audios = []
        let capsule = []
        let cap = snapshot.val()
        
        this.setState({
          lastKey: prevChildKey
        })

        Object.values(cap.audios).forEach((audio) => {
          audios = [...audios, {
            active: false,
            name: audio.audioName,
            length: audio.length,
            url: audio.url
          }]
        })

        capsule = [
          ...capsule,
          {
            title: cap.title,
            audios
          }
        ]

        actions.storeCapsuleAudios(capsule)
        actions.loadCpAudioSuccess()

        audios = []
        capsule = []
      })
  }

  createPlayer = (url) => {
    if(this.player) {
      this.player.destroy()
      this.props.actions.changePlayingState('notPlaying')
    }
    this.player = new Player(url)
      .prepare(error => {
        if(error) {
          console.log('error at createPlayer, error is => ', error);
        }
      })
  }

  forward = async () => {
    let next
    const { capsules, playingAudioPos, actions } = this.props
    let pos = capsules[playingAudioPos.i].audios.length

    clearInterval(this.interval)

    // find the next position where we choice in screen
    if (playingAudioPos.j + 1 < pos) {
      next = capsules[playingAudioPos.i].audios[playingAudioPos.j + 1]
      await this.toggleButtonColor(playingAudioPos.i, playingAudioPos.j + 1)
      await actions.settingPlayingAudioInfo(
        next.name,
        next.length,
        {
          sec: null,
          formatted: ''
        },
        next.url,
        {
          i: playingAudioPos.i,
          j: playingAudioPos.j + 1
        },
        'forwardFunction: notChange'
      )
    } else {
        if ( playingAudioPos.i === capsules.length - 1) {
          // if audio reach end of audio's list, then recycle it
          next = capsules[0].audios[0]
          await this.toggleButtonColor(0, 0)
          await actions.settingPlayingAudioInfo(
            next.name,
            next.length,
            {
              sec: null,
              formatted: ''
            },
            next.url,
            {
              i: 0,
              j: 0,

            },
            'forwardFunction: changeToBegin'
          )
        } else {
          next = capsules[playingAudioPos.i + 1].audios[0]
          actions.settingPlayingAudioInfo(next.name, next.length, next.url)
          await this.toggleButtonColor(playingAudioPos.i + 1, 0)
          await actions.settingPlayingAudioInfo(
            next.name,
            next.length,
            {
              sec: null,
              formatted: ''
            },
            next.url,
            {
              i: playingAudioPos.i + 1,
              j: 0,

            },
            'forwardFunction: changeToNext'
          )
        }
    }
    await this.createPlayer(next.url)
    await this.playOrPause()
  }

  backward = async () => {
    let next
    const { capsules, playingAudioPos, actions } = this.props

    clearInterval(this.interval)

    if(playingAudioPos.j - 1 >= 0) {
      next = capsules[playingAudioPos.i].audios[playingAudioPos.j - 1]
      await this.toggleButtonColor(playingAudioPos.i, playingAudioPos.j -1)
      await actions.settingPlayingAudioInfo(
        next.name,
        next.length,
        {
          sec: null,
          formatted: ''
        },
        next.url,
        {
          i: playingAudioPos.i,
          j: playingAudioPos.j - 1,

        },
        'BackwardFunction: Not change'
      )
    } else {
      if ( playingAudioPos.i === 0) {
        // if audio reach Top of audio's list, then recycle it
        next = capsules[0].audios[0]
        await this.toggleButtonColor(0, 0)
        await actions.settingPlayingAudioInfo(
          next.name,
          next.length,
          {
            sec: null,
            formatted: ''
          },
          next.url,
          {
            i: 0,
            j: 0,

          },
          'BackwardFunction: forward to Begin'
        )
      } else {
        let maxLength = capsules[playingAudioPos.i -1].audios.length - 1
        next = capsules[playingAudioPos.i - 1].audios[maxLength]
        await this.toggleButtonColor(playingAudioPos.i - 1, maxLength)
        await actions.settingPlayingAudioInfo(
          next.name,
          next.length,
          {
            sec: null,
            formatted: ''
          },
          next.url,
          {
            i: playingAudioPos.i - 1,
            j: maxLength,

          },
          'BackwardFunction: forward'
        )
      }
    }
    await this.createPlayer(next.url)
    await this.playOrPause()
  }

  playOrPause = () => {
    const { playState, actions } = this.props
    if(playState ==='notPlaying' && this.player) {
      actions.changePlayingState('playing')
      // react-native-audio-toolkit bug
      // only get current time after calling pause
      this.player.pause(() => {
        this.player.play(() => {
          this.audioPlayingTimerStart()
        })
      })
    } else if (!this.player) {
      console.log('player is not found',);
    } else {
      actions.changePlayingState('notPlaying')
      this.player.pause(() => {
        clearInterval(this.interval)
      })
    }
  }

  audioPlayingTimerStart = () => {
    const {
      actions,
      audioName,
      audioLength,
      audioUrl,
      playingAudioPos,
      currentTimeSec,
      playState
    } = this.props

    let currentTimeformatted
    let currentTimeSecNow

    // it's the react-native-audio-toolkit bugs
    // if we seek somewhere we want to listen
    // the currentTime of player's property will lose time
    // so we need to supple it
    let outdatedValue = currentTimeSec * 1000
    let nowValue

    if(this.player) {
      this.interval = setInterval(() => {
        if (playState === 'playing') {
          if (this.player.currentTime && (this.player.currentTime > 0)) {
            console.log('currentTime from audioPlayingTimer', this.player.currentTime)
            console.log('nowValue from audioPlayingTimer', nowValue)
            console.log('outDataValue from audioPlayingTimer', outdatedValue)

            nowValue = this.player.currentTime

            // if seek, we supple some time
            if (nowValue < outdatedValue) {
              nowValue = outdatedValue + 350
            }

            let min = Math.floor(nowValue / 60000)
            let sec = Math.floor(nowValue / 1000) - min * 60

            if (sec < 10) { sec = "0" + sec}
            if (min < 10) { min = "0" + min}

            currentTimeformatted = min + ":" + sec
            currentTimeSecNow = Math.floor(nowValue / 1000)

            actions.settingPlayingAudioInfo(
              audioName,
              audioLength,
              {
                sec: currentTimeSecNow,
                formatted: currentTimeformatted
              },
              audioUrl,
              playingAudioPos,
              'audioPlayingTimerStart: running'
            )

            outdatedValue = nowValue
          } else {
            // when the audio end
            clearInterval(this.interval)
            currentTimeformatted = "00:00"

            actions.settingPlayingAudioInfo(
              audioName,
              audioLength,
              {
                sec: 0,
                formatted: currentTimeformatted
              },
              audioUrl,
              playingAudioPos,
              'audioPlayingTimerStart: stoping'
            )
            actions.changePlayingState('notPlaying')

            this.forward()
          }
        }
      }, 500)
    } else {
      console.log("player is null, so no audio current time")
    }
  }

  seek = (value) => {
    const {
      actions,
      audioLength,
      audioName,
      audioUrl,
      playingAudioPos
    } = this.props
    if(this.player) {
      if(this.player.duration) {


        console.log('valueSeek from seek', value)

        let percent = Number((value / audioLength.sec ).toFixed(2))

        console.log('audioLength.sec from seek', audioLength.sec)
        console.log('percent from seek', percent)

        let position = percent * this.player.duration
        this.player.seek(position, async () => {

          clearInterval(this.interval)

          let sec = Math.floor(value%60)
          let min = Math.floor(value/60)
          
          if(sec<10) { sec = "0"+sec }
          if(min<10) { min = "0"+min }

          let formatted = min+':'+sec

          await actions.settingPlayingAudioInfo(
            audioName,
            audioLength,
            {
              sec: value,
              formatted,
            },
            audioUrl,
            playingAudioPos,
            'seekFunction'
          )
          await this.audioPlayingTimerStart()
        })
      }
    }
  }

  toggleButtonColor = (i, j) => {
    const { capsules, playingAudioPos } = this.props
    if (playingAudioPos.i !== '' && playingAudioPos.j !== '') {
      capsules[playingAudioPos.i].audios[playingAudioPos.j].active = false
    }
    capsules[i].audios[j].active = true
  }

  onPressAudio = async (audio, i, j) => {
    const { actions } = this.props
    
    console.log('audio is', audio)

    // initialize playing audio
    actions.settingPlayingAudioInfo(
      audio.name,
      audio.length,
      {
        sec: null,
        formatted: '00:00'
      },
      audio.url,
      {
        i,j
      },
      'onPressAudio'
    )
    
    this.setState({
      audioBarActive: true
    })

    await this.toggleButtonColor(i, j)
    await this.createPlayer(audio.url)
    await this.playOrPause()
    this.toggleAudioBarUp()
  }

  toggleAudioBarUp = () => {
    const { popoutAudioBarHeight } = this.state
    Animated.spring(
      popoutAudioBarHeight,
      {
        toValue: screenHeight - 160
      }
    ).start()
  }

  toggleAudioBarDown = () => {
    const { popoutAudioBarHeight } = this.state
    Animated.spring(
      popoutAudioBarHeight,
      {
        toValue: screenHeight
      }
    ).start()
  }

  onScroll = (event) => {
    let currentOffsetY = event.nativeEvent.contentOffset.y
    const diff = currentOffsetY - this.state.offsetY

    if (Math.abs(diff) < 5) {
      console.log('unclear')
    } else if (diff<0) {
      this.toggleAudioBarUp()
    } else {
      this.toggleAudioBarDown()
    }

    this.setState({
      offsetY: currentOffsetY
    })
  }

  onScrollEndReached = () => {
    const { lastKey } = this.state
    const { actions } = this.props

    if(lastKey === null ) {
      return
    } else {
      firebase.database()
        .ref('capsules')
        .orderByKey()
        .endAt(lastKey)
        .limitToLast(3)
        .on('child_added', (snapshot, prevChildKey) => {

          if (lastKey === null) {
            return
          }

          if (snapshot.key !== lastKey) {

            this.setState({
              lastKey: prevChildKey
            })

            let cap = snapshot.val()
            let audios = []
            let capsule = []

            Object.values(cap.audios).forEach((audio) => {
              audios = [...audios, {
                active: false,
                name: audio.audioName,
                length: audio.length,
                url: audio.url
              }]
            })

            capsule = [
              ...capsule,
              {
                title: cap.title,
                audios
              }
            ]

            actions.storeCapsuleAudios(capsule)

            audios = []
            capsule = []
          }
        })
    }
  }

  render () {
    let CapUnit = null
    const {
      playState,
      capsules,
      audioName,
      currentTimeFormatted,
      isCpAudioLoaded
    } = this.props

    const { audioBarActive } = this.state

    const { navigate } = this.props.navigation
    if(capsules) {
      CapUnit = capsules.map((cap, i) => {
        return (
          <View key={i} style={styles.capContainer}>
            <View style={styles.capTitle}>
              <Text style={styles.capTitleText}>
                {cap.title}
              </Text>
            </View>
            {
              cap.audios.map((audio, j) =>
                <View key={j} style={styles.capUnit}>
                  <TouchableHighlight
                    style={styles.capPlayPauseButton}
                    onPress={this.onPressAudio.bind(this, audio, i, j)}
                    underlayColor="#fff"
                  >
                    <View style={styles.capAudio}>
                      <Image
                        source={audio.active ? buttons.playing : buttons.playable}
                        style={styles.capPlayPauseButtonImage}
                      />
                      <Text style={audio.active ? styles.capAudioTextPlaying : styles.capAudioTextNotPlaying}>{audio.name}</Text>
                      <Text style={styles.audioLengthText}>{audio.length.formatted}</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              )
            }
          </View>
        )
      })
    }
    return (
      <Container style={styles.container}>
        <View>
          <Image
            style={styles.banner}
            source={require('../../assets/img/knowledgeCapsule/banner.png')}
          />
        </View>
        <Content
          onScroll={audioBarActive ? this.onScroll : null}
          onMomentumScrollEnd={this.onScrollEndReached}
        >
          {
            isCpAudioLoaded
              ? CapUnit
              :
              <View style={styles.loading}>
                <ActivityIndicator
                  animating
                  color="black"
                  size="large"
                />
              </View>
          }
        </Content>
        <Animated.View
          style={[styles.popoutAudioPlayBar, {top: this.state.popoutAudioBarHeight} ]}
        >
          <TouchableHighlight
            transparent
            onPress={this.playOrPause}
            underlayColor="#fff"
          >
            <Image
              source={ playState === 'playing' ? buttons.pause : buttons.playingOnAudioBar}
              style={styles.playPauseButton}
            />
          </TouchableHighlight>
          <View style={styles.popoutAudioBarDes}>
            <Text style={styles.popoutAudioBarText}>
              {audioName}
            </Text>
            <Text style={styles.popoutAudioBarNumber}>
              {currentTimeFormatted ? currentTimeFormatted : '00:00'}
            </Text>
          </View>
          <Button
            transparent
            onPress={() => navigate(
              'PlayAudioScreen',
              {
                player: this.player,
                playOrPauseFunc: this.playOrPause,
                forward: this.forward,
                backward: this.backward,
                seek: this.seek
              }
            )}
          >
            <Image
              source={buttons.expand}
              style={styles.open}
            />
          </Button>
        </Animated.View>
      </Container>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(KnowledgeCapsule)

