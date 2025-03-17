import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text, Button, View } from "react-native";

const SimpleComponent = () => {
  const [count, setCount] = React.useState(0);

  return (
    <View>
      <Text testID="countText">Count: {count}</Text>
      <Button title="Increment" onPress={() => setCount(count + 1)} />
    </View>
  );
};

test("SimpleComponent increments count", () => {
  const { getByText, getByTestId } = render(<SimpleComponent />);
  const button = getByText("Increment");
  const countText = getByTestId("countText");

  fireEvent.press(button);
  expect(countText.props.children.join("")).toContain("Count: 1");
});
