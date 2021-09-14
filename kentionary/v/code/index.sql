select to_translation.name 
        from word
            inner join translation as from_translation on from_translation.word = word.word
            inner join language as from_language on from_translation.language = from_language.language
            inner join translation as to_translation on to_translation.word = word.word
            inner join language as to_language on to_translation.language = to_language.language
        where
            from_translation.name = 'God''
        and
            from_language.name = 'english''
        and
            to_language.name = 'kikuyu'