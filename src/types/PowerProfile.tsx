import { DeviceType } from './DeviceType'
import { ColorMode } from './ColorMode'

export type PowerProfile = {
    manufacturer: string
    modelId: string
    name: string
    aliases: string // Cannot use string[] yet as global search won't work
    deviceType: DeviceType
    colorModes: ColorMode[],
    updateTimestamp: number
  }