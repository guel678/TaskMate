import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type AndroidDatePickerOptions = Parameters<typeof DateTimePickerAndroid.open>[0];

export function openAndroidDatePicker(options: AndroidDatePickerOptions) {
  DateTimePickerAndroid.open(options);
}
