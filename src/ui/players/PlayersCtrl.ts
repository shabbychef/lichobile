import * as throttle from 'lodash/throttle'
import redraw from '../../utils/redraw'
import * as utils from '../../utils'
import router from '../../router'
import { User, Rankings } from '../../lichess/interfaces/user'
import * as xhr from './playerXhr'

export default class PlayersCtrl {
  public currentTab: number

  public isSearchOpen: boolean = false
  public searchResults: readonly string[] = []
  public players?: readonly User[]
  public leaderboard?: Rankings

  constructor(defaultTab?: number) {
    this.currentTab = defaultTab || 0

    xhr.onlinePlayers()
    .then(data => {
      this.players = data
      redraw()
    })
    .catch(utils.handleXhrError)

    xhr.ranking()
    .then(data => {
      this.leaderboard = data
      redraw()
    })
    .catch(utils.handleXhrError)
  }

  public onTabChange = (tabIndex: number) => {
    const loc = window.location.search.replace(/\?tab\=\w+$/, '')
    try {
      window.history.replaceState(window.history.state, '', loc + '?tab=' + tabIndex)
    } catch (e) { console.error(e) }
    this.currentTab = tabIndex
    redraw()
  }

  public closeSearch = (fromBB?: string) => {
    if (fromBB !== 'backbutton' && this.isSearchOpen) router.backbutton.stack.pop()
      this.isSearchOpen = false
  }

  public onInput = throttle((e: Event) => {
    const term = (e.target as HTMLInputElement).value.trim()
    if (term.length >= 3)
      xhr.autocomplete(term).then(data => {
        this.searchResults = data
        redraw()
      })
  }, 250)

  public goSearch = () => {
    router.backbutton.stack.push(this.closeSearch)
    this.isSearchOpen = true
  }

  public goToProfile = (u: string) => {
    router.set('/@/' + u)
  }
}
