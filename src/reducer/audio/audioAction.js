import {
  createActions
} from 'redux-actions'

export default createActions({
  'CHANGE_PLAYING_STATE': playState => playState,
  'STORE_CAPSULE_AUDIOS': audios => audios,
  'SETTING_PLAYING_AUDIO_INFO': (
    name,
    length,
    currentTime,
    url,
    pos,
    from
  ) => ({
    name,
    length,
    currentTime,
    url,
    pos,
    from
  }),
  'LOAD_CP_AUDIO_SUCCESS': state => state
})
