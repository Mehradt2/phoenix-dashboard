def test_api_import():
    from app.main import app
    routes={getattr(r,"path",None) for r in app.routes}
    assert "/api/health" in routes
    assert "/api/reports/{entity_type}.csv" in routes
    assert "/api/reports/{entity_type}" in routes
