const words = [
  {
    english: "algorithm",
    russian: ["алгоритм", "метод"],
  },
  {
    english: "data",
    russian: ["данные", "информация"],
  },
  {
    english: "software",
    russian: ["программное обеспечение", "софт"],
  },
  {
    english: "network",
    russian: ["сеть", "сетевой"],
  },
  {
    english: "machine",
    russian: ["машина", "аппарат"],
  },
  {
    english: "learning",
    russian: ["обучение", "изучение"],
  },
  {
    english: "database",
    russian: ["база данных", "БД"],
  },
  {
    english: "programming",
    russian: ["программирование", "кодирование"],
  },
  {
    english: "artificial",
    russian: ["искусственный", "синтетический"],
  },
  {
    english: "intelligence",
    russian: ["интеллект", "разум"],
  },
  {
    english: "cloud",
    russian: ["облако", "облачный"],
  },
  {
    english: "computing",
    russian: ["вычисление", "расчет"],
  },
  {
    english: "big",
    russian: ["большой", "крупный"],
  },
  {
    english: "blockchain",
    russian: ["блокчейн", "цепочка блоков"],
  },
  {
    english: "cybersecurity",
    russian: ["кибербезопасность", "компьютерная безопасность"],
  },
  {
    english: "deep",
    russian: ["глубокий", "глубинный"],
  },
  {
    english: "mining",
    russian: ["добыча", "извлечение"],
  },
  {
    english: "internet",
    russian: ["интернет", "сеть"],
  },
  {
    english: "virtual",
    russian: ["виртуальный", "условный"],
  },
  {
    english: "reality",
    russian: ["реальность", "действительность"],
  },
  {
    english: "augmented",
    russian: ["дополненный", "расширенный"],
  },
  {
    english: "startup",
    russian: ["стартап", "начинающая компания"],
  },
  {
    english: "venture",
    russian: ["венчурный", "рискованный"],
  },
  {
    english: "capital",
    russian: ["капитал", "средства"],
  },
  {
    english: "cryptocurrency",
    russian: ["криптовалюта", "цифровая валюта"],
  },
  {
    english: "fintech",
    russian: ["финтех", "финансовые технологии"],
  },
  {
    english: "commerce",
    russian: ["коммерция", "торговля"],
  },
  {
    english: "user",
    russian: ["пользователь", "пользовательский"],
  },
  {
    english: "experience",
    russian: ["опыт", "практика"],
  },
  {
    english: "interface",
    russian: ["интерфейс", "взаимодействие"],
  },
  {
    english: "agile",
    russian: ["гибкий", "быстрый"],
  },
  {
    english: "scrum",
    russian: ["скрам", "методология скрам"],
  },
  {
    english: "development",
    russian: ["разработка", "развитие"],
  },
  {
    english: "operations",
    russian: ["операции", "эксплуатация"],
  },
  {
    english: "microservices",
    russian: ["микросервисы", "микрослужбы"],
  },
  {
    english: "serverless",
    russian: ["бессерверный", "серверлесс"],
  },
  {
    english: "containerization",
    russian: ["контейнеризация", "виртуализация"],
  },
  {
    english: "edge",
    russian: ["край", "граница"],
  },
  {
    english: "quantum",
    russian: ["квантовый", "квантово-механический"],
  },
  {
    english: "natural",
    russian: ["естественный", "природный"],
  },
  {
    english: "language",
    russian: ["язык", "речь"],
  },
  {
    english: "processing",
    russian: ["обработка", "переработка"],
  },
  {
    english: "computer",
    russian: ["компьютер", "вычислительная машина"],
  },
  {
    english: "vision",
    russian: ["зрение", "видение"],
  },
  {
    english: "predictive",
    russian: ["предиктивный", "прогнозный"],
  },
  {
    english: "analytics",
    russian: ["аналитика", "анализ"],
  },
  {
    english: "science",
    russian: ["наука", "научный"],
  },
  {
    english: "business",
    russian: ["бизнес", "дело"],
  },
  {
    english: "visualization",
    russian: ["визуализация", "отображение"],
  },
  {
    english: "robotic",
    russian: ["роботизированный", "роботический"],
  },
  {
    english: "process",
    russian: ["процесс", "обработка"],
  },
  {
    english: "automation",
    russian: ["автоматизация", "роботизация"],
  },
  {
    english: "digital",
    russian: ["цифровой", "электронный"],
  },
  {
    english: "transformation",
    russian: ["трансформация", "преобразование"],
  },
  {
    english: "storage",
    russian: ["хранилище", "хранение"],
  },
  {
    english: "warehouse",
    russian: ["склад", "хранилище"],
  },
  {
    english: "lake",
    russian: ["озеро", "водоем"],
  },
  {
    english: "information",
    russian: ["информация", "сведения"],
  },
  {
    english: "security",
    russian: ["безопасность", "защита"],
  },
  {
    english: "encryption",
    russian: ["шифрование", "кодирование"],
  },
  {
    english: "firewall",
    russian: ["брандмауэр", "межсетевой экран"],
  },
  {
    english: "antivirus",
    russian: ["антивирус", "антивирусная программа"],
  },
  {
    english: "malware",
    russian: ["вредоносное ПО", "вредоносная программа"],
  },
  {
    english: "phishing",
    russian: ["фишинг", "мошенничество"],
  },
  {
    english: "penetration",
    russian: ["проникновение", "внедрение"],
  },
  {
    english: "testing",
    russian: ["тестирование", "испытание"],
  },
  {
    english: "vulnerability",
    russian: ["уязвимость", "слабое место"],
  },
  {
    english: "assessment",
    russian: ["оценка", "анализ"],
  },
  {
    english: "privacy",
    russian: ["конфиденциальность", "приватность"],
  },
  {
    english: "governance",
    russian: ["управление", "руководство"],
  },
  {
    english: "quality",
    russian: ["качество", "свойство"],
  },
  {
    english: "cleansing",
    russian: ["очистка", "отчистка"],
  },
  {
    english: "integration",
    russian: ["интеграция", "объединение"],
  },
  {
    english: "migration",
    russian: ["миграция", "перенос"],
  },
  {
    english: "modeling",
    russian: ["моделирование", "проектирование"],
  },
  {
    english: "architecture",
    russian: ["архитектура", "структура"],
  },
  {
    english: "statistical",
    russian: ["статистический", "вероятностный"],
  },
  {
    english: "analysis",
    russian: ["анализ", "исследование"],
  },
  {
    english: "text",
    russian: ["текст", "текстовый"],
  },
  {
    english: "web",
    russian: ["веб", "сетевой"],
  },
  {
    english: "scraping",
    russian: ["скрапинг", "извлечение"],
  },
  {
    english: "generation",
    russian: ["генерация", "создание"],
  },
  {
    english: "speech",
    russian: ["речь", "выступление"],
  },
  {
    english: "recognition",
    russian: ["распознавание", "узнавание"],
  },
  {
    english: "image",
    russian: ["изображение", "образ"],
  },
  {
    english: "facial",
    russian: ["лицевой", "лицевая"],
  },
  {
    english: "pattern",
    russian: ["шаблон", "образец"],
  },
  {
    english: "neural",
    russian: ["нейронный", "нервный"],
  },
  {
    english: "character",
    russian: ["символ", "знак"],
  },
  {
    english: "sentiment",
    russian: ["настроение", "отношение"],
  },
  {
    english: "chatbot",
    russian: ["чат-бот", "виртуальный собеседник"],
  },
  {
    english: "convolutional",
    russian: ["сверточный", "конволюционный"],
  },
  {
    english: "recurrent",
    russian: ["рекуррентный", "повторяющийся"],
  },
  {
    english: "reinforcement",
    russian: ["подкрепление", "усиление"],
  },
  {
    english: "supervised",
    russian: ["контролируемый", "управляемый"],
  },
  {
    english: "unsupervised",
    russian: ["неконтролируемый", "неуправляемый"],
  },
  {
    english: "classification",
    russian: ["классификация", "категоризация"],
  },
  {
    english: "regression",
    russian: ["регрессия", "отступление"],
  },
  {
    english: "clustering",
    russian: ["кластеризация", "группировка"],
  },
  {
    english: "dimensionality",
    russian: ["размерность", "многомерность"],
  },
  {
    english: "reduction",
    russian: ["снижение", "уменьшение"],
  },
  {
    english: "feature",
    russian: ["признак", "характеристика"],
  },
  {
    english: "extraction",
    russian: ["извлечение", "выделение"],
  },
  {
    english: "selection",
    russian: ["выбор", "отбор"],
  },
  {
    english: "ensemble",
    russian: ["ансамбль", "совокупность"],
  },
  {
    english: "boosting",
    russian: ["бустинг", "усиление"],
  },
  {
    english: "bagging",
    russian: ["бэггинг", "агрегирование"],
  },
  {
    english: "stacking",
    russian: ["стекинг", "наслоение"],
  },
  {
    english: "overfitting",
    russian: ["переобучение", "переподгонка"],
  },
  {
    english: "underfitting",
    russian: ["недообучение", "недоподгонка"],
  },
  {
    english: "bias",
    russian: ["смещение", "предвзятость"],
  },
  {
    english: "variance",
    russian: ["дисперсия", "разброс"],
  },
  {
    english: "hyperparameter",
    russian: ["гиперпараметр", "метапараметр"],
  },
  {
    english: "tuning",
    russian: ["настройка", "регулировка"],
  },
  {
    english: "cross-validation",
    russian: ["кросс-валидация", "перекрестная проверка"],
  },
  {
    english: "gradient",
    russian: ["градиент", "наклон"],
  },
  {
    english: "descent",
    russian: ["спуск", "снижение"],
  },
  {
    english: "backpropagation",
    russian: ["обратное распространение", "обратное прохождение"],
  },
  {
    english: "activation",
    russian: ["активация", "возбуждение"],
  },
  {
    english: "function",
    russian: ["функция", "назначение"],
  },
  {
    english: "loss",
    russian: ["потеря", "ошибка"],
  },
  {
    english: "optimization",
    russian: ["оптимизация", "улучшение"],
  },
  {
    english: "regularization",
    russian: ["регуляризация", "упорядочивание"],
  },
  {
    english: "dropout",
    russian: ["отсев", "выпадение"],
  },
  {
    english: "batch",
    russian: ["пакет", "партия"],
  },
  {
    english: "epoch",
    russian: ["эпоха", "период"],
  },
  {
    english: "iteration",
    russian: ["итерация", "повторение"],
  },
  {
    english: "pipeline",
    russian: ["конвейер", "последовательность"],
  },
  {
    english: "preprocessing",
    russian: ["предобработка", "подготовка"],
  },
  {
    english: "postprocessing",
    russian: ["постобработка", "доработка"],
  },
  {
    english: "engineering",
    russian: ["инженерия", "конструирование"],
  },
  {
    english: "scaling",
    russian: ["масштабирование", "шкалирование"],
  },
  {
    english: "normalization",
    russian: ["нормализация", "приведение к норме"],
  },
  {
    english: "encoding",
    russian: ["кодирование", "шифрование"],
  },
  {
    english: "imputation",
    russian: ["импутация", "заполнение пропусков"],
  },
  {
    english: "outlier",
    russian: ["выброс", "аномалия"],
  },
  {
    english: "detection",
    russian: ["обнаружение", "выявление"],
  },
  {
    english: "correlation",
    russian: ["корреляция", "взаимосвязь"],
  },
  {
    english: "covariance",
    russian: ["ковариация", "совместное изменение"],
  },
  {
    english: "multicollinearity",
    russian: ["мультиколлинеарность", "множественная корреляция"],
  },
  {
    english: "hypothesis",
    russian: ["гипотеза", "предположение"],
  },
  {
    english: "inference",
    russian: ["вывод", "умозаключение"],
  },
  {
    english: "confidence",
    russian: ["доверительный", "уверенность"],
  },
  {
    english: "interval",
    russian: ["интервал", "промежуток"],
  },
  {
    english: "significance",
    russian: ["значимость", "существенность"],
  },
  {
    english: "p-value",
    russian: ["p-значение", "вероятность ошибки"],
  },
  {
    english: "distribution",
    russian: ["распределение", "раздача"],
  },
  {
    english: "probability",
    russian: ["вероятность", "возможность"],
  },
  {
    english: "density",
    russian: ["плотность", "густота"],
  },
  {
    english: "estimation",
    russian: ["оценка", "прикидка"],
  },
  {
    english: "parameter",
    russian: ["параметр", "показатель"],
  },
  {
    english: "coefficient",
    russian: ["коэффициент", "множитель"],
  },
  {
    english: "residual",
    russian: ["остаток", "невязка"],
  },
  {
    english: "error",
    russian: ["ошибка", "погрешность"],
  },
  {
    english: "accuracy",
    russian: ["точность", "правильность"],
  },
  {
    english: "precision",
    russian: ["прецизионность", "четкость"],
  },
  {
    english: "recall",
    russian: ["полнота", "чувствительность"],
  },
  {
    english: "f1-score",
    russian: ["ф1-мера", "ф1-показатель"],
  },
  {
    english: "confusion",
    russian: ["смешение", "путаница"],
  },
  {
    english: "matrix",
    russian: ["матрица", "таблица"],
  },
  {
    english: "receiver",
    russian: ["приемник", "получатель"],
  },
  {
    english: "operating",
    russian: ["операционный", "рабочий"],
  },
  {
    english: "characteristic",
    russian: ["характеристика", "особенность"],
  },
  {
    english: "curve",
    russian: ["кривая", "изгиб"],
  },
  {
    english: "area",
    russian: ["область", "площадь"],
  },
  {
    english: "under",
    russian: ["под", "ниже"],
  },
  {
    english: "sensitivity",
    russian: ["чувствительность", "восприимчивость"],
  },
  {
    english: "specificity",
    russian: ["специфичность", "особенность"],
  },
  {
    english: "precision-recall",
    russian: ["точность-полнота", "прецизионность-чувствительность"],
  },
  {
    english: "threshold",
    russian: ["порог", "граница"],
  },
  {
    english: "decision",
    russian: ["решение", "выбор"],
  },
  {
    english: "boundary",
    russian: ["граница", "предел"],
  },
  {
    english: "random",
    russian: ["случайный", "произвольный"],
  },
  {
    english: "forest",
    russian: ["лес", "роща"],
  },
  {
    english: "tree",
    russian: ["дерево", "структура"],
  },
  {
    english: "support",
    russian: ["поддержка", "опора"],
  },
  {
    english: "vector",
    russian: ["вектор", "направление"],
  },
  {
    english: "kernel",
    russian: ["ядро", "сердцевина"],
  },
  {
    english: "trick",
    russian: ["трюк", "уловка"],
  },
  {
    english: "naive",
    russian: ["наивный", "простодушный"],
  },
  {
    english: "bayes",
    russian: ["байес", "байесовский"],
  },
  {
    english: "k-nearest",
    russian: ["к-ближайших", "к-соседних"],
  },
  {
    english: "neighbors",
    russian: ["соседей", "соседи"],
  },
  {
    english: "logistic",
    russian: ["логистический", "логистическая"],
  },
  {
    english: "linear",
    russian: ["линейный", "прямолинейный"],
  },
  {
    english: "polynomial",
    russian: ["полиномиальный", "многочленный"],
  },
  {
    english: "principal",
    russian: ["главный", "основной"],
  },
  {
    english: "component",
    russian: ["компонент", "составляющая"],
  },
  {
    english: "singular",
    russian: ["сингулярный", "единственный"],
  },
  {
    english: "value",
    russian: ["значение", "величина"],
  },
  {
    english: "decomposition",
    russian: ["разложение", "декомпозиция"],
  },
  {
    english: "manifold",
    russian: ["многообразие", "разнообразие"],
  },
  {
    english: "t-distributed",
    russian: ["т-распределенный", "распределенный по Стьюденту"],
  },
  {
    english: "stochastic",
    russian: ["стохастический", "случайный"],
  },
  {
    english: "neighbor",
    russian: ["сосед", "соседний"],
  },
  {
    english: "embedding",
    russian: ["вложение", "встраивание"],
  },
  {
    english: "autoencoders",
    russian: ["автокодировщики", "автоэнкодеры"],
  },
  {
    english: "variational",
    russian: ["вариационный", "изменчивый"],
  },
  {
    english: "generative",
    russian: ["порождающий", "генеративный"],
  },
  {
    english: "adversarial",
    russian: ["состязательный", "противоборствующий"],
  },
  {
    english: "gan",
    russian: ["генеративно-состязательная сеть", "ГСС"],
  },
  {
    english: "transfer",
    russian: ["перенос", "передача"],
  },
  {
    english: "fine-tuning",
    russian: ["тонкая настройка", "доводка"],
  },
  {
    english: "zero-shot",
    russian: ["нулевого выстрела", "без примеров"],
  },
  {
    english: "few-shot",
    russian: ["малого выстрела", "с малым числом примеров"],
  },
  {
    english: "one-shot",
    russian: ["одного выстрела", "с одним примером"],
  },
  {
    english: "meta",
    russian: ["мета", "над"],
  },
  {
    english: "lifelong",
    russian: ["пожизненный", "непрерывный"],
  },
  {
    english: "online",
    russian: ["онлайн", "сетевой"],
  },
  {
    english: "offline",
    russian: ["оффлайн", "автономный"],
  },
  {
    english: "stream",
    russian: ["поток", "струя"],
  },
  {
    english: "real-time",
    russian: ["реального времени", "в реальном времени"],
  },
  {
    english: "incremental",
    russian: ["инкрементный", "пошаговый"],
  },
  {
    english: "active",
    russian: ["активный", "деятельный"],
  },
  {
    english: "implement",
    russian: ["реализовать", "внедрить"],
  },
  {
    english: "deploy",
    russian: ["развернуть", "запустить"],
  },
  {
    english: "optimize",
    russian: ["оптимизировать", "улучшить"],
  },
  {
    english: "debug",
    russian: ["отлаживать", "искать ошибки"],
  },
  {
    english: "compile",
    russian: ["компилировать", "собирать"],
  },
  {
    english: "execute",
    russian: ["выполнять", "запускать"],
  },
  {
    english: "iterate",
    russian: ["повторять", "перебирать"],
  },
  {
    english: "refactor",
    russian: ["рефакторить", "переписывать"],
  },
  {
    english: "scale",
    russian: ["масштабировать", "расширять"],
  },
  {
    english: "maintain",
    russian: ["поддерживать", "обслуживать"],
  },
  {
    english: "upgrade",
    russian: ["обновлять", "модернизировать"],
  },
  {
    english: "configure",
    russian: ["настраивать", "конфигурировать"],
  },
  {
    english: "backup",
    russian: ["резервировать", "копировать"],
  },
  {
    english: "restore",
    russian: ["восстанавливать", "возвращать"],
  },
  {
    english: "encrypt",
    russian: ["шифровать", "кодировать"],
  },
  {
    english: "decrypt",
    russian: ["расшифровывать", "декодировать"],
  },
  {
    english: "authenticate",
    russian: ["аутентифицировать", "подтверждать подлинность"],
  },
  {
    english: "authorize",
    russian: ["авторизовать", "разрешать"],
  },
  {
    english: "validate",
    russian: ["проверять", "подтверждать"],
  },
  {
    english: "parse",
    russian: ["разбирать", "анализировать"],
  },
  {
    english: "serialize",
    russian: ["сериализовать", "преобразовывать в последовательность"],
  },
  {
    english: "deserialize",
    russian: ["десериализовать", "восстанавливать из последовательности"],
  },
  {
    english: "instantiate",
    russian: ["создавать экземпляр", "инстанцировать"],
  },
  {
    english: "inherit",
    russian: ["наследовать", "перенимать"],
  },
  {
    english: "override",
    russian: ["переопределять", "замещать"],
  },
  {
    english: "encapsulate",
    russian: ["инкапсулировать", "скрывать"],
  },
  {
    english: "abstract",
    russian: ["абстрагировать", "обобщать"],
  },
  {
    english: "polymorphism",
    russian: ["полиморфизм", "многообразие форм"],
  },
  {
    english: "dependency",
    russian: ["зависимость", "связь"],
  },
  {
    english: "injection",
    russian: ["внедрение", "инъекция"],
  },
  {
    english: "singleton",
    russian: ["одиночка", "единственный экземпляр"],
  },
  {
    english: "factory",
    russian: ["фабрика", "производитель"],
  },
  {
    english: "observer",
    russian: ["наблюдатель", "слушатель"],
  },
  {
    english: "strategy",
    russian: ["стратегия", "подход"],
  },
  {
    english: "decorator",
    russian: ["декоратор", "оформитель"],
  },
  {
    english: "adapter",
    russian: ["адаптер", "переходник"],
  },
  {
    english: "proxy",
    russian: ["прокси", "заместитель"],
  },
  {
    english: "facade",
    russian: ["фасад", "внешний интерфейс"],
  },
  {
    english: "composite",
    russian: ["составной", "композитный"],
  },
  {
    english: "bridge",
    russian: ["мост", "связующее звено"],
  },
  {
    english: "flyweight",
    russian: ["легковес", "приспособленец"],
  },
  {
    english: "mediator",
    russian: ["посредник", "медиатор"],
  },
  {
    english: "command",
    russian: ["команда", "приказ"],
  },
  {
    english: "memento",
    russian: ["хранитель", "снимок"],
  },
  {
    english: "iterator",
    russian: ["итератор", "перечислитель"],
  },
  {
    english: "visitor",
    russian: ["посетитель", "гость"],
  },
  {
    english: "state",
    russian: ["состояние", "статус"],
  },
  {
    english: "template",
    russian: ["шаблон", "образец"],
  },
  {
    english: "repository",
    russian: ["репозиторий", "хранилище"],
  },
  {
    english: "commit",
    russian: ["фиксировать", "совершать"],
  },
  {
    english: "push",
    russian: ["отправлять", "толкать"],
  },
  {
    english: "pull",
    russian: ["получать", "тянуть"],
  },
  {
    english: "merge",
    russian: ["сливать", "объединять"],
  },
  {
    english: "branch",
    russian: ["ветка", "ответвление"],
  },
  {
    english: "fork",
    russian: ["форк", "ответвление"],
  },
  {
    english: "clone",
    russian: ["клонировать", "копировать"],
  },
  {
    english: "checkout",
    russian: ["переключаться", "извлекать"],
  },
  {
    english: "rebase",
    russian: ["перебазировать", "менять основание"],
  },
  {
    english: "stash",
    russian: ["прятать", "откладывать"],
  },
  {
    english: "tag",
    russian: ["метка", "тег"],
  },
  {
    english: "hook",
    russian: ["хук", "перехватчик"],
  },
  {
    english: "diff",
    russian: ["различие", "разница"],
  },
  {
    english: "patch",
    russian: ["патч", "заплатка"],
  },
  {
    english: "cherry-pick",
    russian: ["вишенка", "выборочное применение"],
  },
  {
    english: "squash",
    russian: ["сжимать", "объединять"],
  },
];

export default words;
