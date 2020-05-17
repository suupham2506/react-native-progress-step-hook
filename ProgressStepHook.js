import React from "react";
import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import PropTypes from "prop-types";

const STEP_STATUS = {
  CURRENT: "current",
  FINISHED: "finished",
  UNFINISHED: "unfinished",
};

const ProgressStepHook = (props) => {
  const {
    style,
    stepCount,
    direction,
    currentPosition,
    labels,
    renderLabel,
    renderStepIndicator,
    onPress,
  } = props;

  const defaultStyles = {
    stepIndicatorSize: 30,
    currentStepIndicatorSize: 40,
    separatorStrokeWidth: 3,
    separatorStrokeUnfinishedWidth: 0,
    separatorStrokeFinishedWidth: 0,
    currentStepStrokeWidth: 5,
    stepStrokeWidth: 0,
    stepStrokeCurrentColor: "#6A76FE",
    stepStrokeFinishedColor: "#6A76FE",
    stepStrokeUnFinishedColor: "#6A76FE",
    separatorFinishedColor: "#6A76FE",
    separatorUnFinishedColor: "#9E4FF0",
    stepIndicatorFinishedColor: "#6A76FE",
    stepIndicatorUnFinishedColor: "#9E4FF0",
    stepIndicatorCurrentColor: "#ffffff",
    stepIndicatorLabelFontSize: 15,
    currentStepIndicatorLabelFontSize: 15,
    stepIndicatorLabelCurrentColor: "#000",
    stepIndicatorLabelFinishedColor: "#ffffff",
    stepIndicatorLabelUnFinishedColor: "rgba(0,0,0,0.5)",
    labelColor: "#000",
    labelSize: 13,
    labelAlign: "center",
    currentStepLabelColor: "#6A76FE",
  };

  const flexibleStyle = Object.assign(defaultStyles, style);

  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [progressBarSize, setProgressBarSize] = React.useState(0);
  const [customStyles, setCustomStyles] = React.useState(flexibleStyle);

  const progressAnim = React.useRef(new Animated.Value(0));
  const sizeAnim = React.useRef(
    new Animated.Value(customStyles.stepIndicatorSize)
  );
  const borderRadiusAnim = React.useRef(
    new Animated.Value(customStyles.stepIndicatorSize / 2)
  );

  React.useEffect(() => {
    setCustomStyles(Object.assign(customStyles, style));
  }, [style]);

  React.useEffect(() => {
    onCurrentPositionChanged(currentPosition);
  }, [currentPosition]);

  const stepPressed = (position) => {
    onPress && onPress(position);
  };

  const onCurrentPositionChanged = (position) => {
    if (position > stepCount - 1) {
      position = stepCount - 1;
    }
    const animateToPosition = (progressBarSize / (stepCount - 1)) * position;
    sizeAnim.current.setValue(customStyles.stepIndicatorSize);
    borderRadiusAnim.current.setValue(customStyles.stepIndicatorSize / 2);
    Animated.sequence([
      Animated.timing(progressAnim.current, {
        toValue: animateToPosition,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(sizeAnim.current, {
          toValue: customStyles.currentStepIndicatorSize,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(borderRadiusAnim.current, {
          toValue: customStyles.currentStepIndicatorSize / 2,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  const renderProgressBarBackground = () => {
    let progressBarBackgroundStyle;
    if (direction === "vertical") {
      progressBarBackgroundStyle = {
        backgroundColor: customStyles.separatorUnFinishedColor,
        position: "absolute",
        left: (width - customStyles.separatorStrokeWidth) / 2,
        top: height / (2 * stepCount),
        bottom: height / (2 * stepCount),
        width:
          customStyles.separatorStrokeUnfinishedWidth == 0
            ? customStyles.separatorStrokeWidth
            : customStyles.separatorStrokeUnfinishedWidth,
      };
    } else {
      progressBarBackgroundStyle = {
        backgroundColor: customStyles.separatorUnFinishedColor,
        position: "absolute",
        top: (height - customStyles.separatorStrokeWidth) / 2,
        left: width / (2 * stepCount),
        right: width / (2 * stepCount),
        height:
          customStyles.separatorStrokeUnfinishedWidth == 0
            ? customStyles.separatorStrokeWidth
            : customStyles.separatorStrokeUnfinishedWidth,
      };
    }
    return (
      <View
        onLayout={(event) => {
          if (direction === "vertical") {
            setProgressBarSize(event.nativeEvent.layout.height);
            onCurrentPositionChanged(currentPosition);
          } else {
            setProgressBarSize(event.nativeEvent.layout.width);
            onCurrentPositionChanged(currentPosition);
          }
        }}
        style={progressBarBackgroundStyle}
      />
    );
  };

  const renderProgressBar = () => {
    let progressBarStyle;
    if (direction === "vertical") {
      progressBarStyle = {
        backgroundColor: customStyles.separatorFinishedColor,
        position: "absolute",
        left: (width - customStyles.separatorStrokeWidth) / 2,
        top: height / (2 * stepCount),
        bottom: height / (2 * stepCount),
        width:
          customStyles.separatorStrokeFinishedWidth == 0
            ? customStyles.separatorStrokeWidth
            : customStyles.separatorStrokeFinishedWidth,
        height: progressAnim.current,
      };
    } else {
      progressBarStyle = {
        backgroundColor: customStyles.separatorFinishedColor,
        position: "absolute",
        top: (height - customStyles.separatorStrokeWidth) / 2,
        left: width / (2 * stepCount),
        right: width / (2 * stepCount),
        height:
          customStyles.separatorStrokeFinishedWidth == 0
            ? customStyles.separatorStrokeWidth
            : customStyles.separatorStrokeFinishedWidth,
        width: progressAnim.current,
      };
    }
    return <Animated.View style={progressBarStyle} />;
  };

  const renderIndicatorStep = () => {
    let steps = [];
    for (let position = 0; position < stepCount; position++) {
      steps.push(
        <TouchableWithoutFeedback
          key={position}
          onPress={() => stepPressed(position)}
        >
          <View
            style={[
              styles.stepContainer,
              direction === "vertical"
                ? { flexDirection: "column" }
                : { flexDirection: "row" },
            ]}
          >
            {renderStep(position)}
          </View>
        </TouchableWithoutFeedback>
      );
    }
    return (
      <View
        onLayout={(event) => {
          setWidth(event.nativeEvent.layout.width);
          setHeight(event.nativeEvent.layout.height);
        }}
        style={[
          styles.stepIndicatorContainer,
          direction === "vertical"
            ? {
                flexDirection: "column",
                width: customStyles.currentStepIndicatorSize,
              }
            : {
                flexDirection: "row",
                height: customStyles.currentStepIndicatorSize,
              },
        ]}
      >
        {steps}
      </View>
    );
  };

  const renderStepLabels = () => {
    var labelViews = labels.map((label, index) => {
      const selectedStepLabelStyle =
        index === currentPosition
          ? { color: customStyles.currentStepLabelColor }
          : { color: customStyles.labelColor };
      return (
        <TouchableWithoutFeedback
          style={styles.stepLabelItem}
          key={index}
          onPress={() => stepPressed(index)}
        >
          <View style={styles.stepLabelItem}>
            {renderLabel ? (
              renderLabel({
                position: index,
                stepStatus: getStepStatus(index),
                label,
                currentPosition,
              })
            ) : (
              <Text
                style={[
                  styles.stepLabel,
                  selectedStepLabelStyle,
                  {
                    fontSize: customStyles.labelSize,
                    fontFamily: customStyles.labelFontFamily,
                  },
                ]}
              >
                {label}
              </Text>
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View
        style={[
          styles.stepLabelsContainer,
          direction === "vertical"
            ? { flexDirection: "column", paddingHorizontal: 4 }
            : { flexDirection: "row", paddingVertical: 4 },
          { alignItems: customStyles.labelAlign },
        ]}
      >
        {labelViews}
      </View>
    );
  };

  const renderStep = (position) => {
    let stepStyle;
    let indicatorLabelStyle;
    switch (getStepStatus(position)) {
      case STEP_STATUS.CURRENT: {
        stepStyle = {
          backgroundColor: customStyles.stepIndicatorCurrentColor,
          borderWidth: customStyles.currentStepStrokeWidth,
          borderColor: customStyles.stepStrokeCurrentColor,
          height: sizeAnim.current,
          width: sizeAnim.current,
          borderRadius: borderRadiusAnim.current,
        };
        indicatorLabelStyle = {
          fontSize: customStyles.currentStepIndicatorLabelFontSize,
          color: customStyles.stepIndicatorLabelCurrentColor,
        };

        break;
      }
      case STEP_STATUS.FINISHED: {
        stepStyle = {
          backgroundColor: customStyles.stepIndicatorFinishedColor,
          borderWidth: customStyles.stepStrokeWidth,
          borderColor: customStyles.stepStrokeFinishedColor,
          height: customStyles.stepIndicatorSize,
          width: customStyles.stepIndicatorSize,
          borderRadius: customStyles.stepIndicatorSize / 2,
        };
        indicatorLabelStyle = {
          fontSize: customStyles.stepIndicatorLabelFontSize,
          color: customStyles.stepIndicatorLabelFinishedColor,
        };
        break;
      }

      case STEP_STATUS.UNFINISHED: {
        stepStyle = {
          backgroundColor: customStyles.stepIndicatorUnFinishedColor,
          borderWidth: customStyles.stepStrokeWidth,
          borderColor: customStyles.stepStrokeUnFinishedColor,
          height: customStyles.stepIndicatorSize,
          width: customStyles.stepIndicatorSize,
          borderRadius: customStyles.stepIndicatorSize / 2,
        };
        indicatorLabelStyle = {
          overflow: "hidden",
          fontSize: customStyles.stepIndicatorLabelFontSize,
          color: customStyles.stepIndicatorLabelUnFinishedColor,
        };
        break;
      }
      default:
    }

    return (
      <Animated.View key={"step-indicator"} style={[styles.step, stepStyle]}>
        {renderStepIndicator ? (
          renderStepIndicator({
            position,
            stepStatus: getStepStatus(position),
          })
        ) : (
          <Text style={indicatorLabelStyle}>{`${position + 1}`}</Text>
        )}
      </Animated.View>
    );
  };

  const getStepStatus = (stepPosition) => {
    if (stepPosition === currentPosition) {
      return STEP_STATUS.CURRENT;
    } else if (stepPosition < currentPosition) {
      return STEP_STATUS.FINISHED;
    } else {
      return STEP_STATUS.UNFINISHED;
    }
  };

  return (
    <View
      style={[
        styles.container,
        direction === "vertical"
          ? { flexDirection: "row", flex: 1 }
          : { flexDirection: "column" },
      ]}
    >
      {width !== 0 && renderProgressBarBackground()}
      {width !== 0 && renderProgressBar()}
      {renderIndicatorStep()}
      {labels && renderStepLabels()}
    </View>
  );
};

ProgressStepHook.propTypes = {
  currentPosition: PropTypes.number,
  stepCount: PropTypes.number,
  customStyles: PropTypes.object,
  direction: PropTypes.oneOf(["vertical", "horizontal"]),
  labels: PropTypes.array,
  onPress: PropTypes.func,
  renderStepIndicator: PropTypes.func,
  renderLabel: PropTypes.func,
};

ProgressStepHook.defaultProps = {
  currentPosition: 0,
  stepCount: 5,
  customStyles: {},
  direction: "horizontal",
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "transparent",
  },
  stepLabelsContainer: {
    justifyContent: "space-around",
  },
  step: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  stepLabelItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProgressStepHook;
