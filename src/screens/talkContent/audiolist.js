import React, {Component} from 'react'
import {
    Text,
    View,
    TouchableHighlight,
    Image,
    Animated,
    Dimensions
  } from 'react-native'
import Slider from 'react-native-slider'
let margin = Number((width * 0.04).toFixed())
const { width } = Dimensions.get('window')

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: 430,
    paddingLeft: margin,
    paddingRight: margin
  },
  caption: {
    fontSize: 15,
    marginTop: 16,
    marginBottom: 15,
    marginLeft: 9,
    color: 'rgb(33, 33, 33)'
  },
  divideSection: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 8
  },
  rec: {
    backgroundColor: 'rgb(31, 191, 179)',
    width: 6,
    height: 17
  },
  divideText: {
    fontSize: 15,
    marginLeft: 10
  },
  unit: {
    padding: 0
  },
  animationView: {
    overflow: 'hidden',
    marginBottom: 11,
    marginTop: 11
  },
  animationView2: {
    overflow: 'hidden',
    marginBottom: 11,
    marginTop: 11
  },
  animationView3: {
    overflow: 'hidden',
    marginBottom: 11,
    marginTop: 11
  },
  animationView4: {
    overflow: 'hidden',
    marginBottom: 11,
    marginTop: 11
  },
  animationView5: {
    overflow: 'hidden',
    marginBottom: 11,
    marginTop: 11
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 9,
    color: 'rgb(33, 33 ,33)',
    height: 18
  },
  subTitle: {
    flexDirection: 'row'
  },
  subTitleLeftContainer: {
    flex: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  subTitleRightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  timeText: {
    fontSize: 12,
    height: 17,
    fontWeight: '600',
    color: 'rgb(31, 191, 179)'
  },
  track: {
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgb(238, 238, 238)',
    marginLeft: margin * 0.35,
    marginRight: margin * 0.35
  },
  trackThumbDisable: {
    top: 22,
    width: 20,
    height: 20,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    borderColor: 'rgb(238, 238, 238)',
    borderWidth: 2
  },
  trackThumb: {
    top: 22,
    width: 20,
    height: 20,
    borderRadius: 30 / 2,
    backgroundColor: 'white',
    borderColor: 'rgb(31, 191, 179)',
    borderWidth: 2
  },
  pp: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  ppImage: {
    height: 40,
    width: 40
  },
  hr: {
    height: 1,
    width: width - margin * 2,
    backgroundColor: 'rgb(224, 224, 224)'
  }
}

export default class AudioList extends Component {
    state = {
        progress: 0,
        playing: false, // audio playing or not for Icon
        active: false, // accordion
        animationHeight: new Animated.Value(),
        duration: 0,
        sliderThumbStatus: true  // true mean disable
  
      }
  render () {
    const { sectionaudios } = this.props
    return (
      <Animated.View
        style={[styles.animationView, {height: this.state.animationHeight}]}
        >
        <View onLayout={this._setMinHeight.bind(this)}>
          <TouchableHighlight
            onPress={this._toggleAudioView.bind(this)}
            underlayColor='#fff'
            >
            <View style={styles.subTitle}>
              <View style={styles.subTitleLeftContainer}>
                <Text style={styles.title}>什麼是『 知識型網紅 』？</Text>
              </View>
              <View style={styles.subTitleRightContainer}>
                <Text style={styles.timeText}>01:46</Text>
              </View>
            </View>
          </TouchableHighlight>
        </View>

        <View onLayout={this._setMaxHeight.bind(this)}>
          <Slider
            value={this.state.progress}
            step={1}
            maximumValue={103}
            trackStyle={styles.track}
            thumbStyle={this.state.sliderThumbStatus ? styles.trackThumbDisable : styles.trackThumb}
            minimumTrackTintColor='rgb(31, 191, 179)'
            thumbTouchSize={{width: 20, height: 20}}
            disabled={this.state.sliderThumbStatus}
            />
          <TouchableHighlight
            onPress={this._onPress.bind(this)}
            underlayColor='#fff'
            style={styles.pp}
            >
            <Image
              source={icon}
              style={styles.ppImage}
              />
          </TouchableHighlight>
        </View>
      </Animated.View>
    )
  }
}
