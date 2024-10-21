import sqlite3

class UserProgress:
    def __init__(self, db_name='user_progress.db'):
        self.conn = sqlite3.connect(db_name)
        self.create_table()

    def create_table(self):
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_progress
            (user_id TEXT, word TEXT, familiarity INTEGER,
            PRIMARY KEY (user_id, word))
        ''')
        self.conn.commit()

    def update_word_familiarity(self, user_id, word, correct):
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO user_progress (user_id, word, familiarity)
            VALUES (?, ?, COALESCE(
                (SELECT familiarity FROM user_progress WHERE user_id = ? AND word = ?) +
                CASE WHEN ? THEN 1 ELSE -1 END,
                CASE WHEN ? THEN 1 ELSE 0 END
            ))
        ''', (user_id, word, user_id, word, correct, correct))
        self.conn.commit()

    def get_word_familiarity(self, user_id, word):
        cursor = self.conn.cursor()
        cursor.execute('SELECT familiarity FROM user_progress WHERE user_id = ? AND word = ?', (user_id, word))
        result = cursor.fetchone()
        return result[0] if result else 0

    def close(self):
        self.conn.close()
