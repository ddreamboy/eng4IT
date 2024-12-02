import React from "react";
import {
  AreaChart,
  Card,
  Title,
  Text,
  BarChart,
  DonutChart,
} from "@tremor/react";
import {
  Book,
  Star,
  TrendingUp,
  Clock,
  Check,
  MessageSquare,
  Layers,
  BookOpen,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const ExerciseTypeCard = ({ type, count, successRate }) => {
  const getIcon = () => {
    switch (type) {
      case "chat":
        return <MessageSquare size={24} />;
      case "matching":
        return <Layers size={24} />;
      case "reading":
        return <BookOpen size={24} />;
      default:
        return <Activity size={24} />;
    }
  };

  return (
    <Card className="bg-dark-card border border-gray-800">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-xl">{getIcon()}</div>
        <div>
          <Text className="text-gray-400">{type}</Text>
          <div className="flex items-center gap-2">
            <Title className="text-2xl text-primary">{count}</Title>
            <Text className="text-sm text-gray-400">упражнений</Text>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            className="bg-primary h-full rounded-full"
          />
        </div>
        <Text className="text-sm text-gray-400 mt-2">
          Успешность {successRate.toFixed(1)}%
        </Text>
      </div>
    </Card>
  );
};

const SuccessRateCard = ({ stats }) => (
  <Card className="bg-dark-card border border-gray-800">
    <Title className="text-primary mb-4">Успешность выполнения</Title>
    <DonutChart
      data={[
        { name: "Высокая (80-100%)", value: stats.high_success },
        { name: "Средняя (50-79%)", value: stats.medium_success },
        { name: "Низкая (0-49%)", value: stats.low_success },
      ]}
      category="value"
      index="name"
      colors={["emerald", "yellow", "red"]}
      className="h-40"
    />
  </Card>
);

const StatisticsPanel = ({ statistics }) => {
  if (!statistics) return null;

  const {
    overview,
    exercise_stats,
    success_stats,
    learning_curve,
    recent_activity,
    weekly_activity,
  } = statistics;

  // Вычисляем streak (дни подряд)
  const calculateStreak = (activity) => {
    let streak = 0;
    const today = new Date().toDateString();

    for (let i = activity.length - 1; i >= 0; i--) {
      const activityDate = new Date(activity[i].date).toDateString();
      if (activityDate === today || streak > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Статистика по дням
  const dailyStats = {
    newWords: recent_activity.filter((a) => a.type === "new_word").length,
    studiedWords: recent_activity.filter((a) => a.type === "study").length,
    reviewedWords: recent_activity.filter((a) => a.type === "review").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Основные показатели */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-dark-card border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Book className="text-primary" size={24} />
            </div>
            <div>
              <Text className="text-gray-400">Незнакомых слов</Text>
              <Title className="text-2xl text-primary">
                {overview.unknown_words}
              </Title>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overview.learning_progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
            <Text className="text-sm text-gray-400 mt-2">
              Изучено {overview.learning_progress}%
            </Text>
          </div>
        </Card>

        <Card className="bg-dark-card border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Star className="text-yellow-500" size={24} />
            </div>
            <div>
              <Text className="text-gray-400">Дней подряд</Text>
              <Title className="text-2xl text-yellow-500">
                {calculateStreak(recent_activity)}
              </Title>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <span>Последняя активность:</span>
            <span>
              {new Date(recent_activity[0]?.date).toLocaleDateString()}
            </span>
          </div>
        </Card>

        <Card className="bg-dark-card border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <div>
              <Text className="text-gray-400">За сегодня</Text>
              <Title className="text-2xl text-blue-500">
                {dailyStats.studiedWords}
              </Title>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
            <div>Новых слов: {dailyStats.newWords}</div>
            <div>Повторений: {dailyStats.reviewedWords}</div>
          </div>
        </Card>
      </div>

      {/* Статистика по типам упражнений */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exercise_stats.map((stat) => (
          <ExerciseTypeCard
            key={stat.type}
            type={stat.type}
            count={stat.count}
            successRate={stat.success_rate}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* График прогресса */}
        <Card className="bg-dark-card border border-gray-800">
          <Title className="text-primary mb-4">Прогресс изучения</Title>
          <AreaChart
            className="h-72"
            data={learning_curve}
            index="date"
            categories={["success_rate"]}
            colors={["emerald"]}
            valueFormatter={(number) => `${number.toFixed(1)}%`}
          />
        </Card>

        {/* Статистика успешности */}
        <SuccessRateCard stats={success_stats} />
      </div>

      {/* Активность по дням недели */}
      <Card className="bg-dark-card border border-gray-800">
        <Title className="text-primary mb-4">Активность по дням недели</Title>
        <BarChart
          className="h-64"
          data={weekly_activity}
          index="day"
          categories={["words_count"]}
          colors={["emerald"]}
        />
      </Card>

      {/* Последняя активность */}
      <Card className="bg-dark-card border border-gray-800">
        <Title className="text-primary mb-4">Последняя активность</Title>
        <div className="space-y-4">
          {recent_activity.slice(0, 5).map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl"
            >
              {activity.type === "study" ? (
                <Check className="text-green-500" size={20} />
              ) : activity.type === "review" ? (
                <Clock className="text-blue-500" size={20} />
              ) : (
                <Book className="text-yellow-500" size={20} />
              )}
              <div className="flex-1">
                <Text className="text-gray-200">{activity.description}</Text>
                <Text className="text-sm text-gray-400">
                  {new Date(activity.date).toLocaleString()}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatisticsPanel;
