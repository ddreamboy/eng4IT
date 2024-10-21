import os
import json
from youtube_search import YoutubeSearch
from youtube_transcript_api import YouTubeTranscriptApi
from tqdm import tqdm


def search_youtube_videos(query, language='en', max_results=10):
    '''Ищет видео на YouTube и проверяет наличие субтитров.'''
    search = YoutubeSearch(f'{query} tutorial', max_results=max_results)
    results = search.to_dict()

    videos = []
    for result in results:
        video_id = result['id']
        title = result['title']

        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript = transcript_list.find_transcript([language])
            if transcript:
                videos.append({'id': video_id, 'title': title})
        except Exception as e:
            print(f'Ошибка проверки субтитров для видео {title}: {e}')

    return videos


def save_video_subtitles(video_id, language='en'):
    '''Сохраняет субтитры видео в файл.'''
    try:
        # Проверка на существование файла с таким video_id
        existing_files = os.listdir('subtitles')
        if any(video_id in file for file in existing_files):
            print(f'Субтитры для видео {video_id} уже существуют. Пропускаем.')
            return

        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])

        os.makedirs('subtitles', exist_ok=True)
        file_number = len(existing_files) + 1
        file_name = f'subtitles/{file_number:03d}_{video_id}.txt'

        with open(file_name, 'w', encoding='utf-8') as f:
            for entry in transcript:
                text = entry['text']
                f.write(f'{text}\n')

        print(f'Субтитры для видео {video_id} сохранены в файл "{file_name}".')

    except Exception as e:
        print(f'Ошибка сохранения субтитров для видео {video_id}: {e}')


if __name__ == '__main__':
    with open('search_queries.json', 'r') as f:
        search_queries = json.load(f)

    total_queries = len(search_queries)
    total_videos_processed = 0
    total_videos_saved = 0

    for query_index, query in enumerate(tqdm(search_queries, desc='Обработка запросов')):
        print(f'\nОбработка запроса {query_index + 1}/{total_queries}: \'{query}\'')
        videos = search_youtube_videos(query)
        print(f'Найдено {len(videos)} видео с субтитрами')

        for video in tqdm(videos, desc='Обработка видео', leave=False):
            total_videos_processed += 1
            video_id = video['id']
            if not any(video_id in file for file in os.listdir('subtitles')):
                save_video_subtitles(video_id)
                total_videos_saved += 1
            else:
                print(f'Видео {video_id} уже обработано ранее. Пропускаем.')

        print(f'Запрос \'{query}\' обработан. Обработано видео: {len(videos)}, '
              f'Сохранено новых: {total_videos_saved}')

    print(f'\nИтого: Обработано запросов: {total_queries}, '
          f'Проверено видео: {total_videos_processed}, '
          f'Сохранено новых субтитров: {total_videos_saved}')
