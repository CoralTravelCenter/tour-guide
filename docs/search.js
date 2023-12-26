const package = {
    isCharter: true,
    isRegular: true,
    Guest: {
        Adults:   2,
        Children: [2, 12]
    },
    SelectedDate: '2024-02-08',
    // DateRange: 3,
    BeginDate: '2024-02-05',
    EndDate: '2024-02-11',
    Acc: [7, 8, 9],
    Departures: [{
        Id:    2671,
        Label: 'Москва'
    }],

    Destination: [{
        Id:               'Country1',
        DataId:           1,
        TopDataId:        '',
        ParentDataId:     '',
        FullTitle:        'Турция (Turkey)',
        Title:            'Turkey',
        TitleRu:          'Турция',
        ParentTitle:      '',
        ParentTitleRu:    '',
        Weight:           4,
        Score:            107374.43999454784,
        ModelType:        1,
        HasAirport:       false,
        Priority:         1,
        RecordSourceType: 2,
        NearestAirports:  [10, 3, 6719, 1, 147, 2, 22, 9, 6, 5, 6778, 11, 37],
    }]
}

query = {
    "q":    {
        "Bgn":           "01.01.2024",
        "End":           "07.01.2024",
        "Acc":           "7,14",
        "Gest":          "2",
        "Q":             "bu2BUOCtNg0VSUHgSEKkd8kHgk7fRcZbgyISYmWw0PypFuKgSzj9VzOQfIK0zpQ0GPLIqBroJ7BO4GuD7e8vo4NsJPbaU+crGW+AV+D7+3Q3f5Uc1HaBITn6UxXJY1tF9MAUw2wG+46c9z2SZMcdXg==",
        "Ts":            0,
        "Las":           false,
        "AcId":          0,
        "FDate":         "0001-01-01T00:00:00Z",
        "Ref":           false,
        "Pstatus":       false,
        "TransferPrice": 0,
        "Chr":           true,
        "Rglr":          true,
        "Srt":           1
    },
    "f":    {
        "Rh": false,
        "Ao": ["available"]
    },
    "page": 1
}

q = {
    "Bgn":           "05.02.2024",
    "End":           "11.02.2024",
    "Dr":            "3",
    "Acc":           "7",
    "Gest":          "2,2,12",
    "Q":             "Sjs9zSIgUlWSwztndG4R7HhURsdL79AxgwotScs+kiDWG6q+sRhn9sFsfDuv6WhabRmoEcs/ob5ZvyFVaXlXi0e+0mBoUIo5lufwSaMhqNmdP7iDBVIBpHENOwje5oV7f7698KzMBGxgRx4eWXEqOA==",
    "Ts":            0,
    "Las":           false,
    "AcId":          0,
    "FDate":         "0001-01-01T00:00:00Z",
    "Ref":           false,
    "Pstatus":       false,
    "TransferPrice": 0.0,
    "Chr":           true,
    "Rglr":          false,
    "Srt":           1
};
f = {
    "Pr":  [100000.0, 200000.0],
    "Rg":  [79, 84, 87, 90, 91],
    "Rh":  false,
    "Ao":  ["available"],
    "Lt":  ["1", "49"],
    "Hf":  [3],
    "Rf":  [14],
    "Bch": [13]
};
page=1;
pp = '';
sort = '';

//================================================================
hotel = {
    Destination: {
        Id:               'Country12',
        DataId:           12,
        TopDataId:        '',
        ParentDataId:     '',
        FullTitle:        'Египет (Egypt)',
        Title:            'Egypt',
        TitleRu:          'Египет',
        ParentTitle:      '',
        ParentTitleRu:    '',
        Weight:           4,
        Score:            43281.72000075907,
        ModelType:        1,
        HasAirport:       false,
        Priority:         1,
        RecordSourceType: 2,
        NearestAirports:  [],
    },
    BeginDate:        '2024-01-03',
    EndDate:          '2024-01-12',
    Guest:            {
        Adults:   2,
        Children: [2, 12]
    },
};
