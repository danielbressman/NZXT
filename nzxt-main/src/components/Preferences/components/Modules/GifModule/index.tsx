import React, { ChangeEvent } from 'react'

import { usePreferencesStore } from 'store/preferences'
import { TBlendMode } from 'store/preferences/types'

import { useDebounce, useWindowSize } from 'hooks'

import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'

import GifPicker, { Theme } from 'gif-picker-react'

import { AiOutlineSearch as SearchIcon, AiFillDelete as RemoveIcon } from 'react-icons/ai'

import { Range } from 'components/Preferences/components/Range'
import { Dialog } from 'components/Preferences/components/Dialog'
import { IDialogActions } from 'components/Preferences/components/Dialog/types'

import giphyLogo from './assets/giphy.gif'

import { Container } from './styles'

const tenorApiKey = import.meta.env.VITE_TENOR_API
const giphyApiKey = import.meta.env.VITE_GIPHY_API
const gf = new GiphyFetch(giphyApiKey)

export const GifModule = () => {
  const blendSelectRef = React.useRef<HTMLSelectElement>(null)

  const preferencesStore = usePreferencesStore()

  const [windowWidth] = useWindowSize()

  const [gifEngine, setGifEngine] = React.useState('giphy')

  const removeGifDialog = React.useRef<IDialogActions>(null)

  const [searchTerm, setSearchTerm] = React.useState('')
  const debouncedTerm = useDebounce(searchTerm, 1000)

  const fetchGifs = (offset: number) =>
    gf.search(debouncedTerm as string, { offset, limit: 10, type: 'gifs' })

  const handleRemoveGif = () => {
    preferencesStore.removeGif()
  }

  const handleChangeBlend = (event: ChangeEvent<HTMLSelectElement>) => {
    preferencesStore.updateGif({ blend: event.target.value as TBlendMode })

    setTimeout(() => {
      blendSelectRef?.current?.focus()
    }, 100)
  }

  const BlendSelect = () => (
    <div className="blendSelect">
      <span>Blend mode</span>

      <select
        ref={blendSelectRef}
        defaultValue={preferencesStore.current.gif.blend}
        onChange={handleChangeBlend}
      >
        <option value="normal">normal</option>
        <option value="multiply">multiply</option>
        <option value="screen">screen</option>
        <option value="overlay">overlay</option>
        <option value="darken">darken</option>
        <option value="lighten">lighten</option>
        <option value="color-dodge">color-dodge</option>
        <option value="color-burn">color-burn</option>
        <option value="hard-light">hard-light</option>
        <option value="soft-light">soft-light</option>
        <option value="difference">difference</option>
        <option value="exclusion">exclusion</option>
        <option value="hue">hue</option>
        <option value="saturation">saturation</option>
        <option value="color">color</option>
        <option value="luminosity">luminosity</option>
      </select>
    </div>
  )

  return (
    <Container className={`${preferencesStore.current.gif.url ? '--is-gifSet' : ''}`}>
      <div className="preview">
        {preferencesStore.current.gif.url && (
          <RemoveIcon
            title={'remove gif'}
            onClick={() => removeGifDialog.current?.open()}
          />
        )}

        <video
          src={preferencesStore.current.gif.url}
          autoPlay
          muted
          loop
          poster={preferencesStore.current.gif.url}
          controls={false}
          width={120}
        />

        <BlendSelect />

        <Range
          label="Size"
          value={preferencesStore.current.gif.size}
          onChange={value =>
            preferencesStore.updateGif({
              size: value,
            })
          }
        />

        <Range
          label="Blur"
          value={preferencesStore.current.gif.blur}
          onChange={value =>
            preferencesStore.updateGif({
              blur: value,
            })
          }
        />

        <Range
          label="Brightness"
          value={preferencesStore.current.gif.brightness}
          onChange={value =>
            preferencesStore.updateGif({
              brightness: value,
            })
          }
        />

        <Range
          label="Contrast"
          value={preferencesStore.current.gif.contrast}
          onChange={value =>
            preferencesStore.updateGif({
              contrast: value,
            })
          }
        />

        <Range
          label="Alpha"
          value={preferencesStore.current.gif.alpha}
          onChange={value =>
            preferencesStore.updateGif({
              alpha: value,
            })
          }
        />
      </div>

      <div className="gif-tab">
        <div className="gif-tabSelectorContainer">
          <div
            className={`gif-tabSelector ${gifEngine === 'giphy' ? '--is-active' : ''}`}
            onClick={() => setGifEngine('giphy')}
          >
            Giphy
          </div>

          <div
            className={`gif-tabSelector ${gifEngine === 'tenor' ? '--is-active' : ''}`}
            onClick={() => setGifEngine('tenor')}
          >
            Tenor
          </div>
        </div>

        <div className="gif-tabContent">
          {gifEngine === 'tenor' ? (
            <GifPicker
              tenorApiKey={tenorApiKey}
              theme={Theme.DARK}
              width={windowWidth - 250}
              onGifClick={gif => preferencesStore.updateGif({ url: gif.url })}
            />
          ) : (
            <>
              <div className="search">
                <div className="searchInput">
                  <input
                    type="text"
                    defaultValue={searchTerm}
                    onChange={event => setSearchTerm(event.target.value)}
                    placeholder="search gif"
                  />
                  <SearchIcon />
                  <img src={giphyLogo} height={36} />
                </div>

                <Grid
                  className="grid"
                  key={debouncedTerm as string}
                  width={windowWidth - 250}
                  columns={4}
                  noLink
                  fetchGifs={fetchGifs}
                  onGifClick={gif =>
                    preferencesStore.updateGif({ url: gif.images.original.mp4 })
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        ref={removeGifDialog}
        title={'Do you really want to do this?'}
        onConfirm={handleRemoveGif}
      />
    </Container>
  )
}
