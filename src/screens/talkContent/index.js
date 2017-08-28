// @flow
'use strict'
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native';
import IntroAccordion from './introAccordion'
import Info from './info'
import GuideList from './guideList'
import { Container, Content } from 'native-base'
import FirebaseDB from '../../api/lib/FirebaseDB'
import LectureModule from '../../api/lectureModule'

const styles = {
  division: {
    height: 8,
    backgroundColor: 'rgb(250, 250, 250)'
  }
}

class TalkContent extends Component {
  state = {
    lecture: {}
  }
  componentDidMount () {
    let x = new LectureModule().load('-KsblrqFjYVud2BHDq2E')
    x.then((x) => {
      console.log(x.lectureTitle)
      this.setState({lecture: x})
    })
  }
  render () {
    return (
      <Container>
        <Content>
          <Info lectureTitle={this.state.lecture.lectureTitle}/>
          <View style={styles.division} />
          <IntroAccordion intro={this.state.lecture.intro}/>
          <View style={styles.division} />
          <GuideList lecture={this.state.lecture}/>
        </Content>
      </Container>
    )
  }
}

export default TalkContent
