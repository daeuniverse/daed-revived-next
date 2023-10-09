import dayjs from 'dayjs'

const timeReg = /([0-9]+)([a-zA-Z]+)/

type Time = {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

export const parseDigitAndUnit = (
  timeStr: string,
  output: Time = { hours: 0, milliseconds: 0, minutes: 0, seconds: 0 }
): Time => {
  const matchRes = timeStr.match(timeReg)

  if (!matchRes) return output

  const digit = Number.parseInt(matchRes[1])
  const unit = matchRes[2].toLowerCase()

  switch (unit) {
    case 'h':
      output.hours = digit

      break
    case 'm':
      output.minutes = digit

      break
    case 's':
      output.seconds = digit

      break
    case 'ms':
      output.milliseconds = digit

      break
  }

  return parseDigitAndUnit(timeStr.replace(timeReg, ''), output)
}

export const deriveTime = (timeStr: string, outputUnit: 'ms' | 's') =>
  dayjs.duration(parseDigitAndUnit(timeStr)).as(outputUnit === 'ms' ? 'milliseconds' : 'seconds')
