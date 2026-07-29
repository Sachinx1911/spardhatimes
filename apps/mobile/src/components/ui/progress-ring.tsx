import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '@/theme/tokens';

interface ProgressRingProps {
  /** 0-1. */
  progress: number;
  size?: number;
  thickness?: number;
  color?: string;
  /** मधोमध दाखवायचा मजकूर. नाही दिला तर टक्केवारी दाखवते. */
  label?: string;
  sublabel?: string;
}

/**
 * गोल progress — My Test Series चं "10%", Result चं "78%", Profile चं "65%".
 *
 * SVG वापरलं आहे कारण RN मध्ये गोल कंस काढायचा दुसरा मार्ग नाही (border-radius च्या
 * युक्त्या अर्धवट कंसासाठी चालत नाहीत).
 */
export function ProgressRing({
  progress,
  size = 64,
  thickness = 6,
  color = colors.success,
  label,
  sublabel,
}: ProgressRingProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size }}>
      {/* -90° फिरवल्याने कंस १२ वाजल्याच्या जागेपासून सुरू होतो, ३ वाजल्यापासून नाही. */}
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.label, { fontSize: size / 4.5 }]}>
          {label ?? `${Math.round(clamped * 100)}%`}
        </Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
  },
  // RN 0.86 मध्ये `StyleSheet.absoluteFillObject` उरलेलं नाही — काठ स्पष्ट लिहिले आहेत.
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    color: colors.text,
  },
  sublabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
