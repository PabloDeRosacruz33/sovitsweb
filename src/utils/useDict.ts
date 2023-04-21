import { useCallback, useState } from "react";

export function useDict<T>(initial: T): {
  value: T;
  updateValue: (newValue: T, spread?: boolean) => void;
} {
  /* Custom hook to manage a dictionary.

  Args:
    initial: initial value for dictionary
  
  Returns:
    value: value of the dictionary
    updateValue; update the value of the dictionary
  */
  const [value, setValue] = useState(initial);

  const updateValue = useCallback(
    (newValue: T, spread = true) => {
      /* Update the value of the dictionary.

    Args:
      newValue: a dictionary with key: value pairs to be inserted
      spread: if true, merges newValue into the exiting value. if false, overwrites the 
        entire value of the dictionary
     */
      const _newValue =
        typeof newValue === "function" ? newValue(value) : newValue;

      if (spread)
        setValue((v) => {
          return { ...v, ..._newValue };
        });
      else setValue(_newValue);
    },
    [value]
  );

  return { value, updateValue };
}
