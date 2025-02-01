'use client'

import { useState } from 'react'
import type { AISettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

interface AISettingsPanelProps {
  settings: AISettings
  onSettingsChange: (settings: AISettings) => void
}

export default function AISettingsPanel({ settings, onSettingsChange }: AISettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (key: keyof AISettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-white font-medium mb-4">AI Behavior Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Temperature ({settings.temperature})
                <span className="text-xs text-gray-400 ml-2">Controls response randomness</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Top P ({settings.top_p})
                <span className="text-xs text-gray-400 ml-2">Token choice threshold</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.top_p}
                onChange={(e) => handleChange('top_p', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Top K ({settings.top_k})
                <span className="text-xs text-gray-400 ml-2">Limits token choices</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.top_k}
                onChange={(e) => handleChange('top_k', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Frequency Penalty ({settings.frequency_penalty})
                <span className="text-xs text-gray-400 ml-2">Controls repetition</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={settings.frequency_penalty}
                onChange={(e) => handleChange('frequency_penalty', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Presence Penalty ({settings.presence_penalty})
                <span className="text-xs text-gray-400 ml-2">Adjusts topic focus</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={settings.presence_penalty}
                onChange={(e) => handleChange('presence_penalty', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={() => onSettingsChange(DEFAULT_SETTINGS)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 