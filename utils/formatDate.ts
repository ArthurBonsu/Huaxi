import dayjs, { Dayjs as DayJsType } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export type DateType = DayJsType | string | null | undefined

export const timeAgo = (date: DateType) => dayjs().to(dayjs(date))

export const dateAtTime = (date: DateType) => dayjs(date).format('MMMM D, YYYY [at] h:mm A')

export const dateFormat = (date: DateType) => dayjs(date).format('MM/DD/YYYY')


